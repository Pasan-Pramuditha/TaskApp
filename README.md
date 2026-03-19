# TaskApp

A full-stack web application with JWT-based authentication and a production data dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router, Axios |
| **Backend** | ASP.NET Core 8 (Web API), C# |
| **Database** | SQL Server (raw ADO.NET — no Entity Framework) |
| **Auth** | JWT Access Tokens + Refresh Tokens, BCrypt password hashing |
| **Hosting** | IIS |

---

## Project Structure

```
TaskApp/
├── Backend/
│   └── TaskApp/
│       ├── Controllers/
│       │   ├── AuthController.cs       # Login, Register, Refresh, Logout endpoints
│       │   ├── ProductsController.cs   # Secured production data endpoint
│       │   └── HomeController.cs
│       ├── Models/                     # DTOs and domain models
│       ├── Data/                       # DatabaseService (SQL connection factory)
│       ├── Program.cs                  # DI, JWT config, CORS, Swagger
│       └── appsettings.json
└── Frontend/
    ├── src/
    │   ├── api.js                      # Centralized Axios client with token refresh interceptor
    │   ├── App.jsx                     # Routes (login / dashboard)
    │   └── components/
    │       ├── Login.jsx               # SLT-themed login page
    │       ├── Dashboard.jsx           # Protected dashboard with data table & logout modal
    │       └── ProtectedRoute.jsx      # Route guard using access token
    ├── index.html
    └── vite.config.js
```

---

## Features

- **Authentication** — Username/password login; passwords stored as BCrypt hashes.
- **JWT Tokens** — Short-lived access token (15 min) + long-lived refresh token (7 days).
- **Token Refresh** — Axios interceptor silently refreshes the access token on 401 responses.
- **Logout** — Revokes all active refresh tokens for the user on the server side.
- **Protected Routes** — Frontend route guard redirects unauthenticated users to `/login`.
- **Dashboard** — Displays production data in a table; glassmorphism UI with particle animations.

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [Node.js 18+](https://nodejs.org/)

### Database Setup

Create the `TaskAppDB` database and run the following tables:

```SQL
CREATE DATABASE TaskAppDB;


USE TaskAppDB;

CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) NULL,
    CreatedDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE Products (
    ProductId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    Price DECIMAL(18,2) NULL,
    StockQuantity INT NULL
);

CREATE TABLE RefreshTokens (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Token NVARCHAR(512) NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    IsRevoked BIT DEFAULT 0,
    CreatedDate DATETIME DEFAULT GETDATE()
);


```

### Backend

1. Update the connection string in `Backend/TaskApp/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Initial Catalog=TaskAppDB;Integrated Security=True;Trust Server Certificate=True"
   }
   ```
2. Update the JWT secret key in `appsettings.json` under `"Jwt"."Key"`.
3. Run the API:
   ```bash
   cd Backend/TaskApp
   dotnet run
   ```
   The API will be available at `https://localhost:7048` (or the port shown in the console).

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` requests to the backend.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | None | Login and receive tokens |
| `POST` | `/api/auth/register` | None | Register a new user |
| `POST` | `/api/auth/refresh` | None | Refresh the access token |
| `POST` | `/api/auth/logout` | None | Revoke all refresh tokens |
| `GET`  | `/api/products` | Bearer Token | Get production data |

---

## Configuration

Key settings in `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "<your-secret-key>",
    "Issuer": "TaskApp",
    "Audience": "TaskAppUsers",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

