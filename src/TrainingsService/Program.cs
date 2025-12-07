using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TrainingsService.Data;
using TrainingsService.Repositories;
using TrainingsService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Port=3306;Database=trainings_db;Uid=root;Pwd=password;";

builder.Services.AddDbContext<TrainingsDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Repository registration
builder.Services.AddScoped<ITrainingRepository, TrainingRepository>();
builder.Services.AddScoped<IUserTrainingRepository, UserTrainingRepository>();

// Service registration
builder.Services.AddScoped<ITrainingService, TrainingService>();

// HttpClient for UsersService communication
builder.Services.AddHttpClient<IUsersServiceClient, UsersServiceClient>(client =>
{
    var usersServiceUrl = builder.Configuration["Services:UsersService:BaseUrl"] ?? "http://users-service:8080";
    client.BaseAddress = new Uri(usersServiceUrl);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "ISG-System-Secret-Key-2024-Very-Long-Secret";
var key = Encoding.ASCII.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = "ISG-System",
        ValidateAudience = true,
        ValidAudience = "ISG-Users",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "İSG Trainings Service API", 
        Version = "v1",
        Description = "İş Sağlığı ve Güvenliği Sistemi - Eğitim Yönetimi Mikroservisi"
    });
    
    // JWT Bearer token support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "İSG Trainings Service API v1");
        c.RoutePrefix = string.Empty; // Swagger UI at root
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database migration on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TrainingsDbContext>();
    try
    {
        context.Database.Migrate();
        Console.WriteLine("Database migrated successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
    }
}

app.Run();
