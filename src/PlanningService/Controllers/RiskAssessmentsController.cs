using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RiskAssessmentsController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public RiskAssessmentsController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RiskAssessment>>> GetAll()
    {
        return await _context.RiskAssessments.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RiskAssessment>> GetById(int id)
    {
        var item = await _context.RiskAssessments.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<RiskAssessment>> Create(RiskAssessment item)
    {
        _context.RiskAssessments.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RiskAssessment item)
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
        var item = await _context.RiskAssessments.FindAsync(id);
        if (item == null) return NotFound();
        _context.RiskAssessments.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
