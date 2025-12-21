using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlMatricesController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public ControlMatricesController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ControlMatrix>>> GetAll()
    {
        return await _context.ControlMatrices.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ControlMatrix>> GetById(int id)
    {
        var item = await _context.ControlMatrices.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<ControlMatrix>> Create(ControlMatrix item)
    {
        _context.ControlMatrices.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ControlMatrix item)
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
        var item = await _context.ControlMatrices.FindAsync(id);
        if (item == null) return NotFound();
        _context.ControlMatrices.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
