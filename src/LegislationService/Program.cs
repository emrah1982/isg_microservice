using Microsoft.EntityFrameworkCore;
using LegislationService.Data;
using Hangfire;
using Hangfire.MySql;
using MySqlConnector;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
           ?? "Server=localhost;Port=3306;Database=legislation_db;Uid=root;Pwd=isg_password_2024;AllowPublicKeyRetrieval=True;SslMode=None;";

// Try connecting to MySQL with simple retry to wait until DB becomes reachable
var maxAttempts = 10;
for (var attempt = 1; attempt <= maxAttempts; attempt++)
{
    try
    {
        using var tmp = new MySqlConnection(conn);
        tmp.Open();
        break; // success
    }
    catch
    {
        if (attempt == maxAttempts) throw;
        Thread.Sleep(TimeSpan.FromSeconds(3));
    }
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 34));
builder.Services.AddDbContext<LegislationDbContext>(options =>
{
    options.UseMySql(conn, serverVersion, mysql =>
    {
        mysql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null);
    });
});

// Hangfire configuration (adjusted for MySqlStorage 2.0.3)
builder.Services.AddHangfire(cfg =>
{
    cfg.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
       .UseSimpleAssemblyNameTypeSerializer()
       .UseRecommendedSerializerSettings()
       .UseStorage(new MySqlStorage(conn, new MySqlStorageOptions
       {
           QueuePollInterval = TimeSpan.FromSeconds(15)
       }));
});
builder.Services.AddHangfireServer();

// App services
builder.Services.AddHttpClient();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LegislationDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHangfireDashboard("/hangfire");

// Recurring jobs disabled until RSS dependencies are restored

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapControllers();

app.Run();
