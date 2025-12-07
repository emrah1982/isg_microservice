using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ExamsService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=exams_db;Uid=root;Pwd=password;";
builder.Services.AddDbContext<ExamsDbContext>(opt =>
    opt.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "İSG Exams Service API", Version = "v1" });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Proper middleware order for CORS
app.UseRouting();
app.UseCors("AllowAll");

// Optional: basic exception handler to ensure consistent error responses with CORS headers
app.UseExceptionHandler(handler =>
{
    handler.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Internal Server Error");
    });
});

app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<ExamsDbContext>();
    try
    {
        ctx.Database.Migrate();
        Console.WriteLine("Exams DB migrated.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Exams DB migration failed: {ex.Message}");
    }
}

app.MapGet("/health", () => Results.Ok("OK"));

app.Run();
