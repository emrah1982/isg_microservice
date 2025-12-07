using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToolboxesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    public ToolboxesController(ActivitiesDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q)
    {
        var data = _db.Toolboxes.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            data = data.Where(x => (x.Title ?? string.Empty).ToLower().Contains(term)
                                || (x.Content ?? string.Empty).ToLower().Contains(term)
                                || (x.Category ?? string.Empty).ToLower().Contains(term)
                                || (x.Keywords ?? string.Empty).ToLower().Contains(term));
        }
        var list = await data.OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt).ThenByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.Toolboxes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Toolbox dto)
    {
        dto.Id = 0;
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;
        _db.Toolboxes.Add(dto);
        await _db.SaveChangesAsync();
        return Created($"api/toolboxes/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Toolbox dto)
    {
        var item = await _db.Toolboxes.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        item.Title = dto.Title;
        item.Content = dto.Content;
        item.Category = dto.Category;
        item.Keywords = dto.Keywords;
        item.CreatedByPersonnelId = dto.CreatedByPersonnelId;
        item.CreatedByPersonName = dto.CreatedByPersonName;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Toolboxes.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        _db.Toolboxes.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
