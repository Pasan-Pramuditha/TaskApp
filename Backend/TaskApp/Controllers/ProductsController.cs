using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using TaskApp.Models;


[Authorize] 
[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly DatabaseService _dbService;

    public ProductsController(DatabaseService dbService)
    {
        _dbService = dbService;
    }

    // GET: Products API
    [HttpGet]
    public IActionResult GetProducts()
    {
        var products = new List<Product>();
        using var connection = _dbService.CreateConnection() as SqlConnection;
        connection.Open();

        // Retrieving data from the Products table
        string query = "SELECT ProductId, Name, Description, Price, StockQuantity FROM Products";
        using var command = new SqlCommand(query, connection);
        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            products.Add(new Product
            {
                ProductId = reader.GetInt32(0),
                Name = reader.GetString(1),
                Description = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                Price = reader.IsDBNull(3) ? 0 : reader.GetDecimal(3),
                StockQuantity = reader.IsDBNull(4) ? 0 : reader.GetInt32(4)
            });
        }

        return Ok(products); // Returning the retrieved data as JSON
    }
}