using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    private readonly ILogger<RemindersController> _logger;

    public RemindersController(ActivitiesDbContext db, ILogger<RemindersController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // GET /api/reminders
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] int? machineId, [FromQuery] int? templateId, [FromQuery] int? days)
    {
        var q = _db.ReminderTasks.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.Status == status);
        if (machineId.HasValue) q = q.Where(r => r.MachineId == machineId);
        if (templateId.HasValue) q = q.Where(r => r.ControlFormTemplateId == templateId);
        if (days.HasValue && days.Value > 0)
        {
            var until = DateTime.UtcNow.AddDays(days.Value);
            q = q.Where(r => r.DueDate <= until);
        }
        var list = await q.OrderBy(r => r.DueDate).ThenBy(r => r.Title).ToListAsync();
        return Ok(list);
    }

    // POST /api/reminders/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var r = await _db.ReminderTasks.FindAsync(id);
        if (r == null) return NotFound();
        if (r.Status == "Completed") return Ok(r);
        r.Status = "Completed";
        r.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(r);
    }

    // DELETE /api/reminders/purge-old?days=90
    [HttpDelete("purge-old")]
    public async Task<IActionResult> PurgeOld([FromQuery] int days = 90)
    {
        var threshold = DateTime.UtcNow.AddDays(-Math.Abs(days));
        var toDelete = await _db.ReminderTasks.Where(r => r.Status == "Completed" && r.CompletedAt != null && r.CompletedAt < threshold).ToListAsync();
        _db.ReminderTasks.RemoveRange(toDelete);
        await _db.SaveChangesAsync();
        return Ok(new { deleted = toDelete.Count });
    }
}
