using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmergencyPlansController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public EmergencyPlansController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmergencyPlan>>> GetAll()
    {
        return await _context.EmergencyPlans.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmergencyPlan>> GetById(int id)
    {
        var item = await _context.EmergencyPlans.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<EmergencyPlan>> Create(EmergencyPlan item)
    {
        _context.EmergencyPlans.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, EmergencyPlan item)
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
        var item = await _context.EmergencyPlans.FindAsync(id);
        if (item == null) return NotFound();
        _context.EmergencyPlans.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
