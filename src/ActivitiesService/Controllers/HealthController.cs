using Microsoft.AspNetCore.Mvc;
using ActivitiesService.Data;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public async Task<IActionResult> Get()
    {
        var useMock = string.Equals(Environment.GetEnvironmentVariable("DAILY_ISG_MOCK"), "true", StringComparison.OrdinalIgnoreCase);
        var result = new Dictionary<string, object?>
        {
            ["service"] = "activities-service",
            ["mock"] = useMock,
            ["time"] = DateTime.UtcNow.ToString("o")
        };

        if (useMock)
        {
            result["db"] = new { status = "skipped", reason = "mock-mode" };
            return Ok(result);
        }

        var db = HttpContext.RequestServices.GetService(typeof(ActivitiesDbContext)) as ActivitiesDbContext;
        if (db is null)
        {
            result["db"] = new { status = "unavailable", reason = "DbContext not registered" };
            return StatusCode(503, result);
        }

        try
        {
            var canConnect = await db.Database.CanConnectAsync();
            if (!canConnect)
            {
                result["db"] = new { status = "down", canConnect };
                return StatusCode(503, result);
            }

            // Lightweight sanity query
            await db.Database.ExecuteSqlRawAsync("SELECT 1");
            result["db"] = new { status = "up", canConnect };
            return Ok(result);
        }
        catch (Exception ex)
        {
            result["db"] = new { status = "error", message = ex.Message };
            return StatusCode(503, result);
        }
    }
}
