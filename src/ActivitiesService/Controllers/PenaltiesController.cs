using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PenaltiesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    public PenaltiesController(ActivitiesDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] int? personnelId)
    {
        // Project with COALESCE at SQL level to avoid DBNull -> string casts
        var data = _db.Penalties.AsNoTracking().Select(x => new Penalty
        {
            Id = x.Id,
            PenaltyNumber = x.PenaltyNumber ?? string.Empty,
            PersonnelId = x.PersonnelId,
            PersonnelName = x.PersonnelName ?? string.Empty,
            PersonnelTcNo = x.PersonnelTcNo ?? string.Empty,
            PersonnelPosition = x.PersonnelPosition ?? string.Empty,
            CompanyId = x.CompanyId,
            CompanyName = x.CompanyName ?? string.Empty,
            IssuedByPersonnelId = x.IssuedByPersonnelId,
            IssuedByPersonName = x.IssuedByPersonName ?? string.Empty,
            PenaltyDate = x.PenaltyDate,
            PenaltyType = x.PenaltyType ?? string.Empty,
            Category = x.Category ?? string.Empty,
            ViolationType = x.ViolationType ?? string.Empty,
            Location = x.Location ?? string.Empty,
            IncidentDateTime = x.IncidentDateTime,
            Severity = x.Severity ?? string.Empty,
            FinancialPenalty = x.FinancialPenalty,
            SuspensionDays = x.SuspensionDays,
            SuspensionStartDate = x.SuspensionStartDate,
            SuspensionEndDate = x.SuspensionEndDate,
            LegalBasis = x.LegalBasis ?? string.Empty,
            Witnesses = x.Witnesses ?? string.Empty,
            Evidence = x.Evidence ?? string.Empty,
            DefenseStatement = x.DefenseStatement ?? string.Empty,
            DefenseDate = x.DefenseDate,
            DecisionReason = x.DecisionReason ?? string.Empty,
            Status = x.Status ?? "Active",
            IsAppealed = x.IsAppealed,
            AppealDate = x.AppealDate,
            AppealReason = x.AppealReason ?? string.Empty,
            AppealDecision = x.AppealDecision ?? string.Empty,
            AppealDecisionDate = x.AppealDecisionDate,
            AttachmentPath = x.AttachmentPath ?? string.Empty,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        });

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            data = data.Where(x => (x.PersonnelName ?? string.Empty).ToLower().Contains(term) || (x.Description ?? string.Empty).ToLower().Contains(term) || (x.PenaltyNumber ?? string.Empty).ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(status))
            data = data.Where(x => x.Status == status);
        if (personnelId.HasValue)
            data = data.Where(x => x.PersonnelId == personnelId.Value);

        var list = await data.OrderByDescending(x => x.PenaltyDate).ThenByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.Penalties.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Penalty dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PersonnelName) && !dto.PersonnelId.HasValue)
            return BadRequest("Personel bilgisi gerekli");
        
        dto.Id = 0;
        dto.PenaltyDate = dto.PenaltyDate == default ? DateTime.UtcNow : dto.PenaltyDate;
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;
        
        // Auto-generate PenaltyNumber if not provided
        if (string.IsNullOrWhiteSpace(dto.PenaltyNumber))
        {
            var maxId = await _db.Penalties.MaxAsync(x => (int?)x.Id) ?? 0;
            dto.PenaltyNumber = $"CZA-{(maxId + 1):D6}";
        }
        
        _db.Penalties.Add(dto);
        await _db.SaveChangesAsync();
        return Created($"api/penalties/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Penalty dto)
    {
        var item = await _db.Penalties.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        item.PenaltyNumber = dto.PenaltyNumber;
        item.PersonnelId = dto.PersonnelId;
        item.PersonnelName = dto.PersonnelName;
        item.IssuedByPersonnelId = dto.IssuedByPersonnelId;
        item.IssuedByPersonName = dto.IssuedByPersonName;
        item.PenaltyDate = dto.PenaltyDate;
        item.PenaltyType = dto.PenaltyType;
        item.Category = dto.Category;
        item.ViolationType = dto.ViolationType;
        item.Description = dto.Description;
        item.Location = dto.Location;
        item.IncidentDateTime = dto.IncidentDateTime;
        item.Severity = dto.Severity;
        item.FinancialPenalty = dto.FinancialPenalty;
        item.SuspensionDays = dto.SuspensionDays;
        item.SuspensionStartDate = dto.SuspensionStartDate;
        item.SuspensionEndDate = dto.SuspensionEndDate;
        item.LegalBasis = dto.LegalBasis;
        item.Witnesses = dto.Witnesses;
        item.Evidence = dto.Evidence;
        item.DefenseStatement = dto.DefenseStatement;
        item.DefenseDate = dto.DefenseDate;
        item.DecisionReason = dto.DecisionReason;
        item.Status = dto.Status;
        item.IsAppealed = dto.IsAppealed;
        item.AppealDate = dto.AppealDate;
        item.AppealReason = dto.AppealReason;
        item.AppealDecision = dto.AppealDecision;
        item.AppealDecisionDate = dto.AppealDecisionDate;
        item.AttachmentPath = dto.AttachmentPath;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Penalties.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        _db.Penalties.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
