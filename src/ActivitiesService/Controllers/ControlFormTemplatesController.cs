using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlFormTemplatesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;

    public ControlFormTemplatesController(ActivitiesDbContext db)
    {
        _db = db;
    }

    // GET: /api/controlformtemplates
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? machineType, [FromQuery] bool? onlyActive)
    {
        var query = _db.ControlFormTemplates.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.ToLower();
            query = query.Where(t =>
                t.TemplateName.ToLower().Contains(s) ||
                t.MachineType.ToLower().Contains(s) ||
                (t.Model != null && t.Model.ToLower().Contains(s)) ||
                (t.SerialNumber != null && t.SerialNumber.ToLower().Contains(s))
            );
        }

        if (!string.IsNullOrWhiteSpace(machineType))
        {
            var mt = machineType.ToLower();
            query = query.Where(t => t.MachineType.ToLower().Contains(mt));
        }

        if (onlyActive == true)
        {
            query = query.Where(t => t.IsActive);
        }

        var list = await query
            .OrderByDescending(t => t.CreatedAt)
            .ThenBy(t => t.TemplateName)
            .ToListAsync();
        return Ok(list);
    }

    // GET: /api/controlformtemplates/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var template = await _db.ControlFormTemplates.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (template == null) return NotFound();
        return Ok(template);
    }

    // POST: /api/controlformtemplates
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ControlFormTemplate template)
    {
        if (string.IsNullOrWhiteSpace(template.TemplateName) || string.IsNullOrWhiteSpace(template.MachineType))
        {
            return BadRequest("Şablon adı ve makine tipi zorunludur.");
        }

        template.TemplateName = template.TemplateName.Trim();
        template.MachineType = template.MachineType.Trim();
        if (!string.IsNullOrWhiteSpace(template.Model)) template.Model = template.Model!.Trim();
        if (!string.IsNullOrWhiteSpace(template.SerialNumber)) template.SerialNumber = template.SerialNumber!.Trim();
        template.ChecklistItemsJson = string.IsNullOrWhiteSpace(template.ChecklistItemsJson) ? "[]" : template.ChecklistItemsJson;
        template.CreatedAt = DateTime.UtcNow;
        template.UpdatedAt = null;

        _db.ControlFormTemplates.Add(template);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
    }

    // PUT: /api/controlformtemplates/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ControlFormTemplate updated)
    {
        var existing = await _db.ControlFormTemplates.FindAsync(id);
        if (existing == null) return NotFound();

        existing.TemplateName = (updated.TemplateName ?? existing.TemplateName).Trim();
        existing.MachineType = (updated.MachineType ?? existing.MachineType).Trim();
        existing.Model = string.IsNullOrWhiteSpace(updated.Model) ? null : updated.Model!.Trim();
        existing.SerialNumber = string.IsNullOrWhiteSpace(updated.SerialNumber) ? null : updated.SerialNumber!.Trim();
        existing.DefaultStatus = string.IsNullOrWhiteSpace(updated.DefaultStatus) ? existing.DefaultStatus : updated.DefaultStatus!;
        existing.DefaultNotes = updated.DefaultNotes;
        existing.ChecklistItemsJson = string.IsNullOrWhiteSpace(updated.ChecklistItemsJson) ? existing.ChecklistItemsJson : updated.ChecklistItemsJson!;
        existing.IsActive = updated.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: /api/controlformtemplates/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var template = await _db.ControlFormTemplates.FindAsync(id);
        if (template == null) return NotFound();
        _db.ControlFormTemplates.Remove(template);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
