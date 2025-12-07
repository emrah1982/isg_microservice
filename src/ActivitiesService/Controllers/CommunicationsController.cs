using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommunicationsController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    public CommunicationsController(ActivitiesDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] int? personnelId,
        [FromQuery] string? companyName, [FromQuery] string? subject)
    {
        var data = _db.Communications.AsNoTracking().Select(x => new CommunicationLetter
        {
            Id = x.Id,
            LetterNumber = x.LetterNumber ?? string.Empty,
            PersonnelId = x.PersonnelId,
            CompanyId = x.CompanyId,
            CompanyName = x.CompanyName ?? string.Empty,
            SenderName = x.SenderName ?? string.Empty,
            ReceiverName = x.ReceiverName ?? string.Empty,
            SentDate = x.SentDate,
            Medium = x.Medium ?? string.Empty,
            Subject = x.Subject ?? string.Empty,
            Content = x.Content ?? string.Empty,
            Status = x.Status ?? "Open",
            AttachmentPath = x.AttachmentPath ?? string.Empty,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        });

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            data = data.Where(x => (x.Subject ?? string.Empty).ToLower().Contains(term)
                                || (x.Content ?? string.Empty).ToLower().Contains(term)
                                || (x.LetterNumber ?? string.Empty).ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(status))
            data = data.Where(x => x.Status == status);
        if (personnelId.HasValue)
            data = data.Where(x => x.PersonnelId == personnelId.Value);
        if (!string.IsNullOrWhiteSpace(companyName))
        {
            var t = companyName.Trim().ToLower();
            data = data.Where(x => (x.CompanyName ?? string.Empty).ToLower().Contains(t));
        }
        if (!string.IsNullOrWhiteSpace(subject))
        {
            var t = subject.Trim().ToLower();
            data = data.Where(x => (x.Subject ?? string.Empty).ToLower().Contains(t));
        }

        var list = await data.OrderByDescending(x => x.SentDate).ThenByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.Communications.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CommunicationLetter dto)
    {
        dto.Id = 0;
        dto.SentDate = dto.SentDate == default ? DateTime.UtcNow : dto.SentDate;
        dto.CreatedAt = DateTime.UtcNow;
        dto.UpdatedAt = DateTime.UtcNow;

        if (string.IsNullOrWhiteSpace(dto.LetterNumber))
        {
            var maxId = await _db.Communications.MaxAsync(x => (int?)x.Id) ?? 0;
            dto.LetterNumber = $"COM-{(maxId + 1):D6}";
        }

        _db.Communications.Add(dto);
        await _db.SaveChangesAsync();
        return Created($"api/communications/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CommunicationLetter dto)
    {
        var item = await _db.Communications.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();

        item.LetterNumber = dto.LetterNumber;
        item.PersonnelId = dto.PersonnelId;
        item.CompanyId = dto.CompanyId;
        item.CompanyName = dto.CompanyName;
        item.SenderName = dto.SenderName;
        item.ReceiverName = dto.ReceiverName;
        item.SentDate = dto.SentDate;
        item.Medium = dto.Medium;
        item.Subject = dto.Subject;
        item.Content = dto.Content;
        item.Status = dto.Status;
        item.AttachmentPath = dto.AttachmentPath;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Communications.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null) return NotFound();
        _db.Communications.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
