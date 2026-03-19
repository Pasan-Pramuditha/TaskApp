using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskApp.Models.DTOs;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly DatabaseService _dbService;
    private readonly IConfiguration _configuration;

    public AuthController(DatabaseService dbService, IConfiguration configuration)
    {
        _dbService = dbService;
        _configuration = configuration;
    }

    // POST: Login API
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        using var connection = _dbService.CreateConnection() as SqlConnection;
        connection.Open();

        // Retrieving the User from the Database
        string query = "SELECT UserId, PasswordHash, Email FROM Users WHERE Username = @Username";
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@Username", request.Username);

        using var reader = command.ExecuteReader();
        if (!reader.Read()) return Unauthorized("Invalid Username or Password.");

        int userId = reader.GetInt32(0);
        string dbPasswordHash = reader.GetString(1);
        string email = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);

        // Checking if the password is correct
        if (!BCrypt.Net.BCrypt.Verify(request.Password, dbPasswordHash))
            return Unauthorized("Invalid Username or Password.");

        
        reader.Close();

        // Creating Access Token and Refresh Token
        var accessToken = GenerateAccessToken(userId.ToString(), request.Username);
        var refreshToken = Guid.NewGuid().ToString(); // Using a GUID as the Refresh Token

        // Saving the Refresh Token in the Database
        string insertTokenQuery = @"INSERT INTO RefreshTokens (UserId, Token, ExpiryDate) 
                                    VALUES (@UserId, @Token, @ExpiryDate)";
        using var tokenCmd = new SqlCommand(insertTokenQuery, connection);
        tokenCmd.Parameters.AddWithValue("@UserId", userId);
        tokenCmd.Parameters.AddWithValue("@Token", refreshToken);
        tokenCmd.Parameters.AddWithValue("@ExpiryDate", DateTime.UtcNow.AddDays(7)); // Expires in 7 days
        tokenCmd.ExecuteNonQuery();

        // Returning Tokens and UserInfo
        var userInfo = new UserInfo
        {
            UserId = userId,
            Username = request.Username,
            Email = email
        };

        return Ok(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = userInfo
        });
    }

    // The method that generates the Access Token
    private string GenerateAccessToken(string userId, string username)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.Name, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // Expires in 15 minutes
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // POST: Register API
    [HttpPost("register")]
    public IActionResult Register([FromBody] LoginRequest request)
    {
        using var connection = _dbService.CreateConnection() as SqlConnection;
        connection.Open();

        // Hashing the password
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Inserting the user into the database
        string query = "INSERT INTO Users (Username, PasswordHash, Email) VALUES (@Username, @PasswordHash, @Email)";
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@Username", request.Username);
        command.Parameters.AddWithValue("@PasswordHash", passwordHash);
        command.Parameters.AddWithValue("@Email", request.Email); 

        command.ExecuteNonQuery();

        return Ok("User registered successfully.");
    }

    // POST: Refresh API
    [HttpPost("refresh")]
    public IActionResult RefreshToken([FromBody] TokenRequest request)
    {
        using var connection = _dbService.CreateConnection() as SqlConnection;
        connection.Open();

        // Check if the Refresh Token exists in the database and has expired.
        string query = "SELECT UserId, ExpiryDate, IsRevoked FROM RefreshTokens WHERE Token = @Token";
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@Token", request.RefreshToken);

        using var reader = command.ExecuteReader();
        if (!reader.Read()) return Unauthorized("Invalid Refresh Token.");

        int userId = reader.GetInt32(0);
        DateTime expiryDate = reader.GetDateTime(1);
        bool isRevoked = reader.GetBoolean(2);

        reader.Close(); 

        if (isRevoked || expiryDate <= DateTime.UtcNow)
            return Unauthorized("Refresh Token has expired or been revoked. Please login again.");

        // Get the user name to create a new token
        string userQuery = "SELECT Username FROM Users WHERE UserId = @UserId";
        using var userCommand = new SqlCommand(userQuery, connection);
        userCommand.Parameters.AddWithValue("@UserId", userId);
        string username = (string)userCommand.ExecuteScalar();

        // Creating a new Access Token and Refresh Token
        var newAccessToken = GenerateAccessToken(userId.ToString(), username);
        var newRefreshToken = Guid.NewGuid().ToString();

        // Deactivate the old Refresh Token (IsRevoked = 1), and insert the new one into the Database
        string updateQuery = @"
        UPDATE RefreshTokens SET IsRevoked = 1 WHERE Token = @OldToken;
        INSERT INTO RefreshTokens (UserId, Token, ExpiryDate) VALUES (@UserId, @NewToken, @ExpiryDate)";

        using var updateCmd = new SqlCommand(updateQuery, connection);
        updateCmd.Parameters.AddWithValue("@OldToken", request.RefreshToken);
        updateCmd.Parameters.AddWithValue("@UserId", userId);
        updateCmd.Parameters.AddWithValue("@NewToken", newRefreshToken);
        updateCmd.Parameters.AddWithValue("@ExpiryDate", DateTime.UtcNow.AddDays(7));
        updateCmd.ExecuteNonQuery();

        
        return Ok(new LoginResponse { AccessToken = newAccessToken, RefreshToken = newRefreshToken });
    }

    // POST: Logout API
    [HttpPost("logout")]
    [AllowAnonymous] 
    public IActionResult Logout([FromBody] TokenRequest request)
    {
        using var connection = _dbService.CreateConnection() as SqlConnection;
        connection.Open();

        // Find the UserId from the provided refresh token
        string getUserQuery = "SELECT UserId FROM RefreshTokens WHERE Token = @Token";
        using var getUserCmd = new SqlCommand(getUserQuery, connection);
        getUserCmd.Parameters.AddWithValue("@Token", request.RefreshToken);
        var userIdObj = getUserCmd.ExecuteScalar();

        if (userIdObj == null)
            return Ok("Logged out successfully."); 

        int userId = Convert.ToInt32(userIdObj);

        // Revoke ALL active refresh tokens for this user 
        string revokeAllQuery = "UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserId = @UserId AND IsRevoked = 0";
        using var revokeCmd = new SqlCommand(revokeAllQuery, connection);
        revokeCmd.Parameters.AddWithValue("@UserId", userId);
        revokeCmd.ExecuteNonQuery();

        return Ok("Logged out successfully.");
    }
}