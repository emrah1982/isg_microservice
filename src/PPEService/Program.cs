using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PPEService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<PpeDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("DefaultConnection")
             ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
             ?? "Server=ppe_db;Port=3306;Database=ppe_db;Uid=root;Pwd=isg_password_2024;AllowPublicKeyRetrieval=True;SslMode=None;";
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "PPEService", Version = "v1" }));

const string OpenCors = "Open";
builder.Services.AddCors(options =>
{
    options.AddPolicy(OpenCors, policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseRouting();

// Ensure CORS headers are present even on errors and handle preflight
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["Access-Control-Allow-Origin"] = "*";
    ctx.Response.Headers["Access-Control-Allow-Headers"] = "*";
    ctx.Response.Headers["Access-Control-Allow-Methods"] = "*";
    if (ctx.Request.Method == "OPTIONS")
    {
        ctx.Response.StatusCode = 200;
        await ctx.Response.CompleteAsync();
        return;
    }
    await next();
});

app.UseCors(OpenCors);

// Minimal exception handler to avoid swallowing CORS headers
app.UseExceptionHandler(_ => { });

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok("OK"));
app.MapControllers().RequireCors(OpenCors);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PpeDbContext>();
    try
    {
        // Use Migrate instead of EnsureCreated to handle schema changes
        await db.Database.MigrateAsync();
        Console.WriteLine("PPE Database migrated successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"PPE Database migration error: {ex.Message}");
        // Fallback to EnsureCreated for initial setup
        try
        {
            await db.Database.EnsureCreatedAsync();
            Console.WriteLine("PPE Database ensured/created successfully (fallback)");
        }
        catch (Exception ex2)
        {
            Console.WriteLine($"PPE Database fallback error: {ex2.Message}");
        }
    }
}

await app.RunAsync();
