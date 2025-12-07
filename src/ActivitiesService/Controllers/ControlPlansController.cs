using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlPlansController : ControllerBase
{
    private readonly ActivitiesDbContext _context;
    private readonly ILogger<ControlPlansController> _logger;

    public ControlPlansController(ActivitiesDbContext context, ILogger<ControlPlansController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET /api/controlplans?templateId=&machineId=&activeOnly=
    [HttpGet]
    public async Task<ActionResult> List([FromQuery] int? templateId, [FromQuery] int? machineId, [FromQuery] bool activeOnly = false)
    {
        var q = _context.ControlPlans
            .AsNoTracking()
            .Include(p => p.Targets)
            .OrderBy(p => p.Name)
            .AsQueryable();

        if (templateId.HasValue)
            q = q.Where(p => p.ControlFormTemplateId == templateId.Value);
        if (activeOnly)
            q = q.Where(p => p.IsActive);
        if (machineId.HasValue)
            q = q.Where(p => p.Targets.Any(t => t.MachineId == machineId.Value));

        var items = await q.ToListAsync();
        return Ok(items);
    }

    public class CreatePlanDto
    {
        public int ControlFormTemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Period { get; set; } = "Daily"; // Daily/Weekly/Monthly/Yearly
        public int Interval { get; set; } = 1;
        public IEnumerable<int>? WeekDays { get; set; } // optional for weekly
        public int? DayOfMonth { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public IEnumerable<int>? MachineIds { get; set; } // targets
    }

    // POST /api/controlplans (tek plan)
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePlanDto dto)
    {
        var plan = new ControlPlan
        {
            ControlFormTemplateId = dto.ControlFormTemplateId,
            Name = dto.Name,
            Period = dto.Period,
            Interval = Math.Max(1, dto.Interval),
            WeekDaysJson = dto.WeekDays != null ? System.Text.Json.JsonSerializer.Serialize(dto.WeekDays) : null,
            DayOfMonth = dto.DayOfMonth,
            StartRule = "OnFirstApproval",
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.MachineIds != null)
        {
            foreach (var mid in dto.MachineIds.Distinct())
            {
                plan.Targets.Add(new ControlPlanTarget { MachineId = mid });
            }
        }

        _context.ControlPlans.Add(plan);
        await _context.SaveChangesAsync();
        return Ok(plan);
    }

    public class BulkCreateDto
    {
        public int ControlFormTemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Period { get; set; } = "Daily";
        public int Interval { get; set; } = 1;
        public IEnumerable<int>? WeekDays { get; set; }
        public int? DayOfMonth { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public required List<int> MachineIds { get; set; }
    }

    // POST /api/controlplans/bulk (çoklu makine için plan)
    [HttpPost("bulk")]
    public async Task<ActionResult> Bulk([FromBody] BulkCreateDto dto)
    {
        if (dto.MachineIds == null || dto.MachineIds.Count == 0)
            return BadRequest("MachineIds is required");

        var weekDaysJson = dto.WeekDays != null ? System.Text.Json.JsonSerializer.Serialize(dto.WeekDays) : null;

        var plans = dto.MachineIds.Distinct().Select(mid => new ControlPlan
        {
            ControlFormTemplateId = dto.ControlFormTemplateId,
            Name = dto.Name,
            Period = dto.Period,
            Interval = Math.Max(1, dto.Interval),
            WeekDaysJson = weekDaysJson,
            DayOfMonth = dto.DayOfMonth,
            StartRule = "OnFirstApproval",
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            Targets = new List<ControlPlanTarget> { new ControlPlanTarget { MachineId = mid } }
        }).ToList();

        _context.ControlPlans.AddRange(plans);
        await _context.SaveChangesAsync();
        return Ok(plans);
    }

    // PUT /api/controlplans/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] CreatePlanDto dto)
    {
        var plan = await _context.ControlPlans.Include(p => p.Targets).FirstOrDefaultAsync(p => p.Id == id);
        if (plan == null) return NotFound();

        plan.Name = dto.Name;
        plan.Period = dto.Period;
        plan.Interval = Math.Max(1, dto.Interval);
        plan.WeekDaysJson = dto.WeekDays != null ? System.Text.Json.JsonSerializer.Serialize(dto.WeekDays) : null;
        plan.DayOfMonth = dto.DayOfMonth;
        plan.StartDate = dto.StartDate;
        plan.EndDate = dto.EndDate;
        plan.IsActive = dto.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;

        if (dto.MachineIds != null)
        {
            var incoming = dto.MachineIds.Distinct().ToHashSet();
            // remove not in incoming
            plan.Targets = plan.Targets.Where(t => incoming.Contains(t.MachineId)).ToList();
            // add new ones
            var existing = plan.Targets.Select(t => t.MachineId).ToHashSet();
            foreach (var mid in incoming)
            {
                if (!existing.Contains(mid)) plan.Targets.Add(new ControlPlanTarget { MachineId = mid });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(plan);
    }

    // DELETE /api/controlplans/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var plan = await _context.ControlPlans.FindAsync(id);
        if (plan == null) return NotFound();
        _context.ControlPlans.Remove(plan);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
