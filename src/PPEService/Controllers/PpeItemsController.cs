using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PPEService.Data;
using PPEService.Entities;

namespace PPEService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PpeItemsController : ControllerBase
{
    private readonly PpeDbContext _ctx;
    public PpeItemsController(PpeDbContext ctx) { _ctx = ctx; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q)
    {
        var query = _ctx.PpeItems.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(term) || (x.Category ?? "").ToLower().Contains(term));
        }
        var list = await query.OrderBy(x => x.Name).ToListAsync();
        return Ok(list);
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _ctx.PpeItems.FindAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PpeItem dto)
    {
        dto.Id = 0;
        dto.StockQuantity = Math.Max(0, dto.StockQuantity);
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;
        _ctx.PpeItems.Add(dto);
        await _ctx.SaveChangesAsync();
        return Created($"api/ppeitems/{dto.Id}", dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PpeItem dto)
    {
        var item = await _ctx.PpeItems.FindAsync(id);
        if (item == null) return NotFound();
        item.Name = dto.Name;
        item.Category = dto.Category;
        item.Standard = dto.Standard;
        item.Size = dto.Size;
        item.IsActive = dto.IsActive;
        item.StockQuantity = Math.Max(0, dto.StockQuantity);
        item.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _ctx.PpeItems.FindAsync(id);
        if (item == null) return NotFound();
        _ctx.PpeItems.Remove(item);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
