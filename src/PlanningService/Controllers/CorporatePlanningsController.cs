using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CorporatePlanningsController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public CorporatePlanningsController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CorporatePlanning>>> GetAll()
    {
        return await _context.CorporatePlannings.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CorporatePlanning>> GetById(int id)
    {
        var item = await _context.CorporatePlannings.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<CorporatePlanning>> Create(CorporatePlanning item)
    {
        _context.CorporatePlannings.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CorporatePlanning item)
    {
        if (id != item.Id) return BadRequest();
        item.UpdatedAt = DateTime.UtcNow;
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.CorporatePlannings.FindAsync(id);
        if (item == null) return NotFound();
        _context.CorporatePlannings.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
