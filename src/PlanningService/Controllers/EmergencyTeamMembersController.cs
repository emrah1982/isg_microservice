using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmergencyTeamMembersController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public EmergencyTeamMembersController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmergencyTeamMember>>> GetAll([FromQuery] string? teamType = null)
    {
        var query = _context.EmergencyTeamMembers.AsQueryable();
        
        if (!string.IsNullOrEmpty(teamType))
        {
            query = query.Where(m => m.TeamType == teamType);
        }
        
        return await query.OrderBy(m => m.TeamType).ThenBy(m => m.PersonnelName).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmergencyTeamMember>> GetById(int id)
    {
        var item = await _context.EmergencyTeamMembers.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<EmergencyTeamMember>> Create(EmergencyTeamMember item)
    {
        _context.EmergencyTeamMembers.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, EmergencyTeamMember item)
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
        var item = await _context.EmergencyTeamMembers.FindAsync(id);
        if (item == null) return NotFound();
        _context.EmergencyTeamMembers.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
