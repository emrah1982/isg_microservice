using ActivitiesService.Data;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Mock mode: bypass DB for docker/dev when DAILY_ISG_MOCK=true
var useMock = string.Equals(
    builder.Configuration["DAILY_ISG_MOCK"] ?? Environment.GetEnvironmentVariable("DAILY_ISG_MOCK"),
    "true",
    StringComparison.OrdinalIgnoreCase
);

// Config
var connStr = builder.Configuration.GetConnectionString("Default")
    ?? Environment.GetEnvironmentVariable("ACTIVITIES_DB")
    ?? "server=activities_db;port=3306;database=activities_db;user=isg_user;password=isg_password_2024";

// Normalize connection string options
if (!connStr.Contains("TreatTinyAsBoolean", StringComparison.OrdinalIgnoreCase))
{
    connStr += ";TreatTinyAsBoolean=true";
}
// Ensure a reasonable connection timeout for cold starts inside Docker
if (!connStr.Contains("Connection Timeout", StringComparison.OrdinalIgnoreCase)
    && !connStr.Contains("Default Command Timeout", StringComparison.OrdinalIgnoreCase))
{
    // MySQL connector honors 'Connection Timeout' (seconds); keep conservative
    connStr += ";Connection Timeout=15;Default Command Timeout=30";
}
// Allow connection without SSL inside docker network and public key retrieval for MySQL 8 caching_sha2_password
if (!Regex.IsMatch(connStr, @"(?i)Ssl\s*Mode\s*=", RegexOptions.CultureInvariant))
{
    connStr += ";SslMode=None";
}
if (!Regex.IsMatch(connStr, @"(?i)AllowPublicKeyRetrieval\s*=", RegexOptions.CultureInvariant))
{
    connStr += ";AllowPublicKeyRetrieval=True";
}
var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
Directory.CreateDirectory(uploadsRoot);

if (!useMock)
{
    builder.Services.AddDbContext<ActivitiesDbContext>(opt =>
    {
        opt.UseMySql(connStr, new MySqlServerVersion(new Version(8, 0, 43)), mySqlOptions =>
        {
            // Resilient retries for transient startup/network errors
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        });
        opt.EnableDetailedErrors();
        opt.EnableSensitiveDataLogging();
    });
}

// HTTP Client for PersonnelService
builder.Services.AddHttpClient("PersonnelService", client =>
{
    client.BaseAddress = new Uri("http://personnel-service:8089");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("Open", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// HTTP Client for DocumentsService
builder.Services.AddHttpClient("DocumentsService", client =>
{
    // Docker ağı içinde servis adı ve port ile erişim
    client.BaseAddress = new Uri("http://documents-service:8084");
    client.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Background services
builder.Services.AddHostedService<ActivitiesService.Services.ReminderScheduler>();

// File upload limits: 10 MB
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

var app = builder.Build();

// Show detailed errors in Development
if (app.Environment.IsDevelopment())
{
}

// CORS must be first
app.UseCors("Open");

app.UseSwagger();
app.UseSwaggerUI();

// Remove HTTPS redirection in development to avoid CORS issues
// app.UseHttpsRedirection();

app.UseStaticFiles(); // serve wwwroot (for uploaded images)

app.MapControllers();

// Log mock mode
app.Logger.LogInformation("Daily ISG Mock Mode: {UseMock}", useMock);
try
{
    var sanitized = Regex.Replace(connStr, @"(?i)(password|pwd)=[^;]*", "$1=***");
    app.Logger.LogInformation("DB Connection String: {ConnStr}", sanitized);
}
catch { }

// NOTE:
// Do not hardcode a port here. In container, we rely on ASPNETCORE_URLS env (default set to http://+:8091)
// and Docker port mapping (e.g., -p 8093:8091). Adding a fixed URL like 8093 causes a port mismatch.

// Ensure DB (commented out for now to avoid connection issues)
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<ActivitiesDbContext>();
//     await db.Database.MigrateAsync();
// }

await app.RunAsync();
