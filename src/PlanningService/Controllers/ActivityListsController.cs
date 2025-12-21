using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityListsController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public ActivityListsController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityList>>> GetAll()
    {
        return await _context.ActivityLists.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityList>> GetById(int id)
    {
        var item = await _context.ActivityLists.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<ActivityList>> Create(ActivityList item)
    {
        _context.ActivityLists.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ActivityList item)
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
        var item = await _context.ActivityLists.FindAsync(id);
        if (item == null) return NotFound();
        _context.ActivityLists.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
