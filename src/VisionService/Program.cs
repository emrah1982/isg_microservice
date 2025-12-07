using Microsoft.OpenApi.Models;
using VisionService.Providers;
using VisionService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// HttpClient for DeepSeek provider
builder.Services.AddHttpClient<DeepSeekVisionProvider>();

// DI registrations
builder.Services.AddScoped<IVisionProvider, DeepSeekVisionProvider>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IVisionService, VisionService.Services.VisionServiceImpl>();

// CORS (allow all for now; tighten in prod)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "İSG Vision Service API",
        Version = "v1",
        Description = "DeepSeek-VL tabanlı görsel uygunsuzluk tespiti"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vision Service v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
