using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachineTemplatesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;

    public MachineTemplatesController(ActivitiesDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var templates = await _db.MachineTemplates
            .Include(m => m.ChecklistItems.OrderBy(i => i.DisplayOrder))
            .Where(m => m.IsActive)
            .OrderBy(m => m.MachineType)
            .AsNoTracking()
            .ToListAsync();

        return Ok(templates);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var template = await _db.MachineTemplates
            .Include(m => m.ChecklistItems.OrderBy(i => i.DisplayOrder))
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (template == null) return NotFound();
        return Ok(template);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MachineTemplate template)
    {
        if (string.IsNullOrWhiteSpace(template.MachineType))
        {
            return BadRequest("Makine tipi zorunludur.");
        }

        template.CreatedAt = DateTime.UtcNow;
        _db.MachineTemplates.Add(template);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MachineTemplate updated)
    {
        var existing = await _db.MachineTemplates.FindAsync(id);
        if (existing == null) return NotFound();

        existing.MachineType = updated.MachineType;
        existing.Description = updated.Description;
        existing.IsActive = updated.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var template = await _db.MachineTemplates.FindAsync(id);
        if (template == null) return NotFound();

        _db.MachineTemplates.Remove(template);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
