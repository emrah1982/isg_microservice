using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/personnel/blacklist")]
public class PersonnelBlacklistController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;

    public PersonnelBlacklistController(PersonnelDbContext ctx)
    {
        _ctx = ctx;
    }

    public record CreateBlacklistEntryRequest(
        int? PersonnelId,
        int? CompanyId,
        string? FullName,
        string? NationalId,
        string? ForeignIdentityNumber,
        string? PassportNumber,
        string? Nationality,
        string Category,
        string Reason,
        string RiskLevel,
        string? Source,
        string? DecisionNumber,
        DateTime? StartDate,
        DateTime? EndDate,
        string? Notes
    );

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? q,
        [FromQuery] bool? isActive,
        [FromQuery] string? category,
        [FromQuery] string? riskLevel,
        [FromQuery] int? companyId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to
    )
    {
        var query = _ctx.Set<BlacklistEntry>().AsNoTracking().AsQueryable();

        if (isActive.HasValue)
            query = query.Where(x => x.IsActive == isActive.Value);

        if (companyId.HasValue)
            query = query.Where(x => x.CompanyId == companyId.Value);

        if (!string.IsNullOrWhiteSpace(category))
        {
            var c = category.Trim().ToLower();
            query = query.Where(x => (x.Category ?? "").ToLower() == c);
        }

        if (!string.IsNullOrWhiteSpace(riskLevel))
        {
            var rl = riskLevel.Trim().ToLower();
            query = query.Where(x => (x.RiskLevel ?? "").ToLower() == rl);
        }

        if (from.HasValue)
            query = query.Where(x => x.StartDate >= from.Value);
        if (to.HasValue)
            query = query.Where(x => x.StartDate <= to.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            var digits = new string(q.Where(char.IsDigit).ToArray());
            query = query.Where(x =>
                (x.FullName ?? "").ToLower().Contains(term) ||
                (x.Reason ?? "").ToLower().Contains(term) ||
                (x.Category ?? "").ToLower().Contains(term) ||
                (!string.IsNullOrEmpty(digits) && (
                    (x.NationalId ?? "").Contains(digits) ||
                    (x.ForeignIdentityNumber ?? "").Contains(digits) ||
                    (x.PassportNumber ?? "").Contains(digits)
                ))
            );
        }

        var list = await query
            .OrderByDescending(x => x.IsActive)
            .ThenByDescending(x => x.StartDate)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlacklistEntryRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Reason))
            return BadRequest(new { message = "Reason zorunludur" });

        if (string.IsNullOrWhiteSpace(req.Category))
            return BadRequest(new { message = "Category zorunludur" });

        if (string.IsNullOrWhiteSpace(req.RiskLevel))
            return BadRequest(new { message = "RiskLevel zorunludur" });

        var digitsTc = new string((req.NationalId ?? string.Empty).Where(char.IsDigit).ToArray());
        var foreignId = (req.ForeignIdentityNumber ?? string.Empty).Trim();
        var passport = (req.PassportNumber ?? string.Empty).Trim();

        if (req.PersonnelId is null && string.IsNullOrWhiteSpace(digitsTc) && string.IsNullOrWhiteSpace(foreignId) && string.IsNullOrWhiteSpace(passport))
            return BadRequest(new { message = "PersonnelId veya kimlik bilgisi (TC/YKN/Pasaport) girilmelidir" });

        Personnel? person = null;
        if (req.PersonnelId.HasValue)
        {
            person = await _ctx.Personnel.AsNoTracking().FirstOrDefaultAsync(p => p.Id == req.PersonnelId.Value);
            if (person == null)
                return BadRequest(new { message = "PersonnelId bulunamadı" });
        }

        var entity = new BlacklistEntry
        {
            PersonnelId = req.PersonnelId,
            CompanyId = req.CompanyId ?? person?.CompanyId,
            FullName = !string.IsNullOrWhiteSpace(req.FullName)
                ? req.FullName!.Trim()
                : (person != null ? (person.FirstName + " " + person.LastName) : null),
            NationalId = !string.IsNullOrWhiteSpace(digitsTc) ? digitsTc : (person?.NationalId),
            ForeignIdentityNumber = !string.IsNullOrWhiteSpace(foreignId) ? foreignId : (person?.ForeignIdentityNumber),
            PassportNumber = !string.IsNullOrWhiteSpace(passport) ? passport : (person?.PassportNumber),
            Nationality = !string.IsNullOrWhiteSpace(req.Nationality) ? req.Nationality!.Trim() : (person?.Nationality),

            Category = req.Category.Trim(),
            Reason = req.Reason.Trim(),
            RiskLevel = req.RiskLevel.Trim(),
            Source = string.IsNullOrWhiteSpace(req.Source) ? null : req.Source.Trim(),
            DecisionNumber = string.IsNullOrWhiteSpace(req.DecisionNumber) ? null : req.DecisionNumber.Trim(),
            StartDate = req.StartDate ?? DateTime.UtcNow,
            EndDate = req.EndDate,
            IsActive = true,
            Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _ctx.Set<BlacklistEntry>().Add(entity);
        await _ctx.SaveChangesAsync();

        return Ok(entity);
    }

    [HttpPost("{id:int}/deactivate")]
    public async Task<IActionResult> Deactivate([FromRoute] int id)
    {
        var entity = await _ctx.Set<BlacklistEntry>().FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        entity.IsActive = false;
        entity.EndDate ??= DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpPost("{id:int}/activate")]
    public async Task<IActionResult> Activate([FromRoute] int id)
    {
        var entity = await _ctx.Set<BlacklistEntry>().FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        entity.IsActive = true;
        entity.EndDate = null;
        entity.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return Ok(entity);
    }
}
