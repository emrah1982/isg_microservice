using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarningsController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    public WarningsController(ActivitiesDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] int? personnelId)
    {
        // Project with COALESCE at SQL level to avoid DBNull -> string casts
        var data = _db.Warnings.AsNoTracking().Select(x => new Warning
        {
            Id = x.Id,
            WarningNumber = x.WarningNumber ?? string.Empty,
            PersonnelId = x.PersonnelId,
            PersonnelName = x.PersonnelName ?? string.Empty,
            PersonnelTcNo = x.PersonnelTcNo ?? string.Empty,
            PersonnelPosition = x.PersonnelPosition ?? string.Empty,
            CompanyId = x.CompanyId,
            CompanyName = x.CompanyName ?? string.Empty,
            IssuedByPersonnelId = x.IssuedByPersonnelId,
            IssuedByPersonName = x.IssuedByPersonName ?? string.Empty,
            WarningDate = x.WarningDate,
            WarningType = x.WarningType ?? string.Empty,
            Category = x.Category ?? string.Empty,
            ViolationType = x.ViolationType ?? string.Empty,
            Description = x.Description ?? string.Empty,
            Location = x.Location ?? string.Empty,
            IncidentDateTime = x.IncidentDateTime,
            Witnesses = x.Witnesses ?? string.Empty,
            ImmediateActions = x.ImmediateActions ?? string.Empty,
            ExpectedImprovement = x.ExpectedImprovement ?? string.Empty,
            FollowUpDate = x.FollowUpDate,
            FollowUpNotes = x.FollowUpNotes ?? string.Empty,
            Status = x.Status ?? "Active",
            IsAcknowledged = x.IsAcknowledged,
            AcknowledgedDate = x.AcknowledgedDate,
            PersonnelResponse = x.PersonnelResponse ?? string.Empty,
            AttachmentPath = x.AttachmentPath ?? string.Empty,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        });

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            data = data.Where(x => (x.PersonnelName ?? "").ToLower().Contains(term) || (x.Description ?? "").ToLower().Contains(term) || (x.WarningNumber ?? "").ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(status))
            data = data.Where(x => x.Status == status);
        if (personnelId.HasValue)
            data = data.Where(x => x.PersonnelId == personnelId.Value);

        var list = await data.OrderByDescending(x => x.WarningDate).ThenByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.Warnings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Warning dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PersonnelName) && !dto.PersonnelId.HasValue)
            return BadRequest("Personel bilgisi gerekli");
        
        dto.Id = 0;
        dto.WarningDate = dto.WarningDate == default ? DateTime.UtcNow : dto.WarningDate;
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;
        
        // Auto-generate WarningNumber if not provided
        if (string.IsNullOrWhiteSpace(dto.WarningNumber))
        {
            var maxId = await _db.Warnings.MaxAsync(x => (int?)x.Id) ?? 0;
            dto.WarningNumber = $"UYR-{(maxId + 1):D6}";
        }
        
        _db.Warnings.Add(dto);
        await _db.SaveChangesAsync();
        return Created($"api/warnings/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Warning dto)
    {
        var item = await _db.Warnings.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        item.WarningNumber = dto.WarningNumber;
        item.PersonnelId = dto.PersonnelId;
        item.PersonnelName = dto.PersonnelName;
        item.PersonnelTcNo = dto.PersonnelTcNo;
        item.PersonnelPosition = dto.PersonnelPosition;
        item.CompanyId = dto.CompanyId;
        item.CompanyName = dto.CompanyName;
        item.IssuedByPersonnelId = dto.IssuedByPersonnelId;
        item.IssuedByPersonName = dto.IssuedByPersonName;
        item.WarningDate = dto.WarningDate;
        item.WarningType = dto.WarningType;
        item.Category = dto.Category;
        item.ViolationType = dto.ViolationType;
        item.Description = dto.Description;
        item.Location = dto.Location;
        item.IncidentDateTime = dto.IncidentDateTime;
        item.Witnesses = dto.Witnesses;
        item.ImmediateActions = dto.ImmediateActions;
        item.ExpectedImprovement = dto.ExpectedImprovement;
        item.FollowUpDate = dto.FollowUpDate;
        item.FollowUpNotes = dto.FollowUpNotes;
        item.Status = dto.Status;
        item.IsAcknowledged = dto.IsAcknowledged;
        item.AcknowledgedDate = dto.AcknowledgedDate;
        item.PersonnelResponse = dto.PersonnelResponse;
        item.AttachmentPath = dto.AttachmentPath;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Warnings.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        _db.Warnings.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
