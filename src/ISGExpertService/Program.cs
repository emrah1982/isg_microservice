using ISGExpertService.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "İSG Expert Service", 
        Version = "v1.0",
        Description = "Kurumsal İş Sağlığı ve Güvenliği Uzman Asistanı API",
        Contact = new OpenApiContact
        {
            Name = "İSG Expert Team",
            Email = "isg@company.com"
        }
    });
    
    // API Key authentication for Swagger
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "ChatGPT API Key",
        Name = "X-API-Key",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });
});

// HttpClient for ChatGPT API
builder.Services.AddHttpClient<ChatGPTService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(2);
    client.DefaultRequestHeaders.Add("User-Agent", "ISG-Expert-Service/1.0");
});

// Register services
builder.Services.AddScoped<ISGPromptService>();
builder.Services.AddScoped<ChatGPTService>();

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "İSG Expert Service v1");
        c.RoutePrefix = string.Empty; // Swagger UI at root
    });
}

app.UseRouting();
app.UseCors();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    service = "İSG Expert Service",
    timestamp = DateTime.UtcNow 
}));

app.MapControllers();

Console.WriteLine("İSG Expert Service başlatılıyor...");
Console.WriteLine("Kurumsal İSG Analizi API'si hazır");
Console.WriteLine("Swagger UI: http://localhost:8091");
Console.WriteLine("📋 Kurumsal İSG Analizi API'si hazır");
Console.WriteLine("🔗 Swagger UI: http://localhost:8091");

await app.RunAsync();
