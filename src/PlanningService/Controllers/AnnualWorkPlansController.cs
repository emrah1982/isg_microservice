using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanningService.Data;
using PlanningService.Entities;

namespace PlanningService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnualWorkPlansController : ControllerBase
{
    private readonly PlanningDbContext _context;

    public AnnualWorkPlansController(PlanningDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnnualWorkPlan>>> GetAll([FromQuery] int? year)
    {
        var query = _context.AnnualWorkPlans.AsQueryable();
        
        if (year.HasValue)
        {
            query = query.Where(p => p.Year == year.Value);
        }
        
        return await query.OrderBy(p => p.PlannedStartDate).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AnnualWorkPlan>> GetById(int id)
    {
        var item = await _context.AnnualWorkPlans.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<AnnualWorkPlan>> Create(AnnualWorkPlan item)
    {
        _context.AnnualWorkPlans.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AnnualWorkPlan item)
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
        var item = await _context.AnnualWorkPlans.FindAsync(id);
        if (item == null) return NotFound();
        _context.AnnualWorkPlans.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("copy-year")]
    public async Task<ActionResult<int>> CopyYear([FromBody] CopyYearRequest request)
    {
        var sourcePlans = await _context.AnnualWorkPlans
            .Where(p => p.Year == request.SourceYear)
            .ToListAsync();

        if (!sourcePlans.Any())
        {
            return NotFound($"No plans found for year {request.SourceYear}");
        }

        var copiedPlans = new List<AnnualWorkPlan>();
        foreach (var sourcePlan in sourcePlans)
        {
            var newPlan = new AnnualWorkPlan
            {
                CompanyId = sourcePlan.CompanyId,
                Year = request.TargetYear,
                Category = sourcePlan.Category,
                SequenceNumber = sourcePlan.SequenceNumber,
                ActivityName = sourcePlan.ActivityName,
                RelatedLegislation = sourcePlan.RelatedLegislation,
                ActivityDescription = sourcePlan.ActivityDescription,
                Department = sourcePlan.Department,
                ResponsiblePerson = sourcePlan.ResponsiblePerson,
                Budget = sourcePlan.Budget,
                Resources = sourcePlan.Resources,
                Priority = sourcePlan.Priority,
                Status = "Planned",
                CompletionPercentage = 0,
                January = sourcePlan.January,
                February = sourcePlan.February,
                March = sourcePlan.March,
                April = sourcePlan.April,
                May = sourcePlan.May,
                June = sourcePlan.June,
                July = sourcePlan.July,
                August = sourcePlan.August,
                September = sourcePlan.September,
                October = sourcePlan.October,
                November = sourcePlan.November,
                December = sourcePlan.December
            };
            copiedPlans.Add(newPlan);
        }

        _context.AnnualWorkPlans.AddRange(copiedPlans);
        await _context.SaveChangesAsync();

        return Ok(new { copiedCount = copiedPlans.Count, targetYear = request.TargetYear });
    }
}

public class CopyYearRequest
{
    public int SourceYear { get; set; }
    public int TargetYear { get; set; }
}
