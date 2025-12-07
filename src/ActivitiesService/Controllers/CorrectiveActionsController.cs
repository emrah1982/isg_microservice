using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CorrectiveActionsController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    public CorrectiveActionsController(ActivitiesDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] string? priority)
    {
        var data = _db.CorrectiveActions.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            data = data.Where(x => (x.Title ?? "").ToLower().Contains(term) || (x.Description ?? "").ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(status)) data = data.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(priority)) data = data.Where(x => x.Priority == priority);
        var list = await data.OrderByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.CorrectiveActions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CorrectiveAction dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required");
        dto.Id = 0;
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;
        _db.CorrectiveActions.Add(dto);
        await _db.SaveChangesAsync();
        return Created($"api/correctiveactions/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CorrectiveAction dto)
    {
        var item = await _db.CorrectiveActions.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        item.IsgReportId = dto.IsgReportId;
        item.ObservationId = dto.ObservationId;
        item.IncidentId = dto.IncidentId;
        item.ActionType = string.IsNullOrWhiteSpace(dto.ActionType) ? item.ActionType : dto.ActionType;
        item.Title = dto.Title;
        item.Description = dto.Description;
        item.Priority = dto.Priority;
        item.Status = dto.Status;
        item.AssignedToPersonnelId = dto.AssignedToPersonnelId;
        item.AssignedToPersonName = dto.AssignedToPersonName;
        item.CreatedByPersonnelId = dto.CreatedByPersonnelId;
        item.CreatedByPersonName = dto.CreatedByPersonName;
        item.PlannedStartDate = dto.PlannedStartDate;
        item.PlannedCompletionDate = dto.PlannedCompletionDate;
        item.ActualStartDate = dto.ActualStartDate;
        item.ActualCompletionDate = dto.ActualCompletionDate;
        item.EstimatedCost = dto.EstimatedCost;
        item.ActualCost = dto.ActualCost;
        item.Resources = dto.Resources;
        item.CompletionNotes = dto.CompletionNotes;
        item.EffectivenessEvaluation = dto.EffectivenessEvaluation;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.CorrectiveActions.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        _db.CorrectiveActions.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
