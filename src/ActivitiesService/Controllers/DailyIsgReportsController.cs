using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ActivitiesService.Entities;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/daily-isg-reports")]
public class DailyIsgReportsController : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyIsgReportDto>>> GetDailyIsgReports(
        [FromQuery] DateTime? date = null,
        [FromQuery] string? shift = null)
    {
        var useMock = string.Equals(Environment.GetEnvironmentVariable("DAILY_ISG_MOCK"), "true", StringComparison.OrdinalIgnoreCase);
        // Try to resolve DbContext optionally
        var db = HttpContext.RequestServices.GetService(typeof(ActivitiesService.Data.ActivitiesDbContext)) as ActivitiesService.Data.ActivitiesDbContext;
        var logger = HttpContext.RequestServices.GetService(typeof(ILogger<DailyIsgReportsController>)) as ILogger<DailyIsgReportsController>;
        if (useMock || db is null)
        {
            // Minimal, static payload to ensure no runtime/serialization issues in mock mode
            return Ok(new []
            {
                new DailyIsgReportDto
                {
                    Id = 1,
                    ReportDate = DateTime.Today.ToString("yyyy-MM-dd"),
                    Shift = "morning",
                    WeatherCondition = "Açık, 22°C",
                    CreatedBy = "İSG Uzmanı",
                    Highlights = "Mock veri",
                    CompletedTasks = new List<DailyReportTaskDto>(),
                    PlannedTasks = new List<DailyReportTaskDto>(),
                    Productions = new List<DailyReportProductionDto>(),
                    CreatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    UpdatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
            });
        }

        // DB mode
        var query = db.DailyIsgReports
            .Include(r => r.Tasks)
            .Include(r => r.Productions)
            .AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(r => r.ReportDate.Date == date.Value.Date);
        }

        if (!string.IsNullOrEmpty(shift))
        {
            query = query.Where(r => r.Shift == shift);
        }

        try
        {
            var reports = await query
                .OrderByDescending(r => r.ReportDate)
                .ThenByDescending(r => r.CreatedAt)
                .ToListAsync();

            var result = reports.Select(r => new DailyIsgReportDto
            {
                Id = r.Id,
                ReportDate = r.ReportDate.ToString("yyyy-MM-dd"),
                Shift = r.Shift,
                WeatherCondition = r.WeatherCondition,
                CreatedBy = r.CreatedBy,
                Highlights = r.Highlights,
                CompletedTasks = r.Tasks
                    .Where(t => t.TaskType == "completed")
                    .Select(t => new DailyReportTaskDto
                    {
                        Id = t.Id,
                        Description = t.Description,
                        StartTime = t.StartTime,
                        EndTime = t.EndTime,
                        Responsible = t.Responsible,
                        Status = t.Status,
                        Priority = t.Priority,
                        Category = t.Category
                    }).ToList(),
                PlannedTasks = r.Tasks
                    .Where(t => t.TaskType == "planned")
                    .Select(t => new DailyReportTaskDto
                    {
                        Id = t.Id,
                        Description = t.Description,
                        StartTime = t.StartTime,
                        EndTime = t.EndTime,
                        Responsible = t.Responsible,
                        Status = t.Status,
                        Priority = t.Priority,
                        Category = t.Category
                    }).ToList(),
                Productions = r.Productions.Select(p => new DailyReportProductionDto
                {
                    Id = p.Id,
                    Description = p.Description,
                    Location = p.Location,
                    SafetyMeasures = p.SafetyMeasures,
                    RiskLevel = p.RiskLevel,
                    EquipmentUsed = p.EquipmentUsed,
                    PersonnelCount = p.PersonnelCount
                }).ToList(),
                CreatedAt = r.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = r.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error while fetching Daily ISG Reports. Query: {Query}", query.ToQueryString());
            return StatusCode(500, new { message = "Daily ISG raporları alınırken hata oluştu.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DailyIsgReportDto>> CreateDailyIsgReport(
        CreateDailyIsgReportRequest request)
    {
        var useMock = string.Equals(Environment.GetEnvironmentVariable("DAILY_ISG_MOCK"), "true", StringComparison.OrdinalIgnoreCase);
        var db = HttpContext.RequestServices.GetService(typeof(ActivitiesService.Data.ActivitiesDbContext)) as ActivitiesService.Data.ActivitiesDbContext;
        if (useMock || db is null)
        {
            var resultMock = new DailyIsgReportDto
            {
                Id = new Random().Next(1000, 9999),
                ReportDate = request.ReportDate,
                Shift = request.Shift,
                WeatherCondition = request.WeatherCondition,
                CreatedBy = request.CreatedBy,
                Highlights = request.Highlights,
                CompletedTasks = request.CompletedTasks ?? new List<DailyReportTaskDto>(),
                PlannedTasks = request.PlannedTasks ?? new List<DailyReportTaskDto>(),
                Productions = request.Productions ?? new List<DailyReportProductionDto>(),
                CreatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            };
            return CreatedAtAction(nameof(GetDailyIsgReports), new { id = resultMock.Id }, resultMock);
        }

        // DB mode - insert
        var report = new ActivitiesService.Entities.DailyIsgReport
        {
            ReportDate = DateTime.Parse(request.ReportDate),
            Shift = request.Shift,
            WeatherCondition = request.WeatherCondition,
            CreatedBy = request.CreatedBy,
            Highlights = request.Highlights,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.DailyIsgReports.Add(report);
        await db.SaveChangesAsync();

        if (request.CompletedTasks?.Any() == true)
        {
            var completedTasks = request.CompletedTasks.Select(t => new ActivitiesService.Entities.DailyReportTask
            {
                DailyIsgReportId = report.Id,
                TaskType = "completed",
                Description = t.Description,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                Responsible = t.Responsible,
                Status = t.Status,
                Priority = t.Priority,
                Category = t.Category
            });
            await db.DailyReportTasks.AddRangeAsync(completedTasks);
        }

        if (request.PlannedTasks?.Any() == true)
        {
            var plannedTasks = request.PlannedTasks.Select(t => new ActivitiesService.Entities.DailyReportTask
            {
                DailyIsgReportId = report.Id,
                TaskType = "planned",
                Description = t.Description,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                Responsible = t.Responsible,
                Status = t.Status,
                Priority = t.Priority,
                Category = t.Category
            });
            await db.DailyReportTasks.AddRangeAsync(plannedTasks);
        }

        if (request.Productions?.Any() == true)
        {
            var prods = request.Productions.Select(p => new ActivitiesService.Entities.DailyReportProduction
            {
                DailyIsgReportId = report.Id,
                Description = p.Description,
                Location = p.Location,
                SafetyMeasures = p.SafetyMeasures,
                RiskLevel = p.RiskLevel,
                EquipmentUsed = p.EquipmentUsed,
                PersonnelCount = p.PersonnelCount
            });
            await db.DailyReportProductions.AddRangeAsync(prods);
        }

        await db.SaveChangesAsync();

        // return shaped dto
        var result = new DailyIsgReportDto
        {
            Id = report.Id,
            ReportDate = report.ReportDate.ToString("yyyy-MM-dd"),
            Shift = report.Shift,
            WeatherCondition = report.WeatherCondition,
            CreatedBy = report.CreatedBy,
            Highlights = report.Highlights,
            CompletedTasks = (request.CompletedTasks ?? new List<DailyReportTaskDto>()).ToList(),
            PlannedTasks = (request.PlannedTasks ?? new List<DailyReportTaskDto>()).ToList(),
            Productions = (request.Productions ?? new List<DailyReportProductionDto>()).ToList(),
            CreatedAt = report.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            UpdatedAt = report.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        };

        return CreatedAtAction(nameof(GetDailyIsgReports), new { id = result.Id }, result);
    }
}

// DTOs
public class DailyIsgReportDto
{
    public int Id { get; set; }
    public string ReportDate { get; set; } = string.Empty;
    public string Shift { get; set; } = string.Empty;
    public string? WeatherCondition { get; set; }
    public string? CreatedBy { get; set; }
    public string? Highlights { get; set; }
    public List<DailyReportTaskDto> CompletedTasks { get; set; } = new();
    public List<DailyReportTaskDto> PlannedTasks { get; set; } = new();
    public List<DailyReportProductionDto> Productions { get; set; } = new();
    public string CreatedAt { get; set; } = string.Empty;
    public string? UpdatedAt { get; set; }
}

public class DailyReportTaskDto
{
    public int? Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Responsible { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
}

public class DailyReportProductionDto
{
    public int? Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? SafetyMeasures { get; set; }
    public string? RiskLevel { get; set; }
    public string? EquipmentUsed { get; set; }
    public int? PersonnelCount { get; set; }
}

public class CreateDailyIsgReportRequest
{
    public string ReportDate { get; set; } = string.Empty;
    public string Shift { get; set; } = string.Empty;
    public string? WeatherCondition { get; set; }
    public string? CreatedBy { get; set; }
    public string? Highlights { get; set; }
    public List<DailyReportTaskDto> CompletedTasks { get; set; } = new();
    public List<DailyReportTaskDto> PlannedTasks { get; set; } = new();
    public List<DailyReportProductionDto> Productions { get; set; } = new();
}
