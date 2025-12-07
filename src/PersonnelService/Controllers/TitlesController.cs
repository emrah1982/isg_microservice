using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TitlesController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    public TitlesController(PersonnelDbContext ctx) { _ctx = ctx; }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var rows = await _ctx.Titles.AsNoTracking().OrderBy(t => t.Name).ToListAsync();
            return Ok(rows);
        }
        catch
        {
            // Fallback: derive from existing Personnel records if Titles table not present yet
            var derived = await _ctx.Personnel.AsNoTracking()
                .Where(p => p.Title != null && p.Title != "")
                .Select(p => p.Title!)
                .Distinct()
                .OrderBy(n => n)
                .ToListAsync();
            var list = derived.Select((n, i) => new Title { Id = i + 1, Name = n }).ToList();
            return Ok(list);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var t = await _ctx.Titles.FindAsync(id);
        if (t == null) return NotFound();
        return Ok(t);
    }

    public class TitleDto { public string Name { get; set; } = string.Empty; }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TitleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name is required");
        var exists = await _ctx.Titles.AnyAsync(x => x.Name == dto.Name);
        if (exists) return Conflict("Title already exists");
        var t = new Title { Name = dto.Name.Trim(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _ctx.Titles.Add(t);
        await _ctx.SaveChangesAsync();
        return Created($"api/titles/{t.Id}", t);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TitleDto dto)
    {
        var t = await _ctx.Titles.FindAsync(id);
        if (t == null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name is required");
        var exists = await _ctx.Titles.AnyAsync(x => x.Id != id && x.Name == dto.Name);
        if (exists) return Conflict("Title already exists");
        t.Name = dto.Name.Trim();
        t.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
        return Ok(t);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await _ctx.Titles.FindAsync(id);
        if (t == null) return NotFound();
        _ctx.Titles.Remove(t);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
