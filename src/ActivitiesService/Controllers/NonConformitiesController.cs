using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.Extensions.Logging;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/nonconformities")]
public class NonConformitiesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    private readonly ILogger<NonConformitiesController> _logger;
    
    public NonConformitiesController(ActivitiesDbContext db, ILogger<NonConformitiesController> logger) 
    { 
        _db = db; 
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        try
        {
            var query = _db.NonConformityFollowUps.AsNoTracking().AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(x => x.Status == status);
            }
            
            var items = await query.OrderByDescending(x => x.Id).ToListAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var item = await _db.NonConformityFollowUps.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return item == null ? NotFound() : Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NonConformityFollowUp dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.NonConformityDescription))
            {
                return BadRequest("NonConformityDescription is required");
            }

            dto.Id = 0;
            dto.CreatedAt = DateTime.UtcNow;
            dto.UpdatedAt = DateTime.UtcNow;
            // Auto-generate DFI code if not provided
            if (string.IsNullOrWhiteSpace(dto.DfiCode))
            {
                dto.DfiCode = await GenerateDfiCodeAsync();
            }

            _db.NonConformityFollowUps.Add(dto);
            await _db.SaveChangesAsync();

            return Created($"api/nonconformities/{dto.Id}", dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Multipart form-data ile oluşturma (resim opsiyonel)
    [HttpPost("with-upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> CreateWithUpload(
        [FromForm] string nonConformityDescription,
        [FromForm] string? rootCauseCategory,
        [FromForm] string? rootCauseDetails,
        [FromForm] string[]? rootCauseCategories,
        [FromForm] string? plannedCorrectiveActions,
        [FromForm] string? preventiveImprovements,
        [FromForm] bool trackingRequired,
        [FromForm] string? trackingExplanation,
        [FromForm] string? status,
        [FromForm] DateTime? targetDate,
        [FromForm] string? assignedToPersonName,
        [FromForm] int? isgReportId,
        [FromForm] int? observationId,
        [FromForm] int? incidentId,
        [FromForm] string? dfiCode,
        IFormFile? attachment
    )
    {
        try
        {
            _logger.LogInformation("CreateWithUpload called. Desc len={Len}, HasFile={HasFile}", nonConformityDescription?.Length ?? 0, attachment != null && attachment.Length > 0);
            if (string.IsNullOrWhiteSpace(nonConformityDescription))
            {
                return BadRequest("NonConformityDescription is required");
            }

            var entity = new NonConformityFollowUp
            {
                NonConformityDescription = nonConformityDescription,
                RootCauseCategory = rootCauseCategory,
                RootCauseDetails = rootCauseDetails,
                PlannedCorrectiveActions = plannedCorrectiveActions,
                PreventiveImprovements = preventiveImprovements,
                TrackingRequired = trackingRequired,
                TrackingExplanation = trackingExplanation,
                Status = string.IsNullOrWhiteSpace(status) ? "Open" : status,
                TargetDate = targetDate,
                AssignedToPersonName = assignedToPersonName,
                IsgReportId = isgReportId,
                ObservationId = observationId,
                IncidentId = incidentId,
                DfiCode = string.IsNullOrWhiteSpace(dfiCode) ? null : dfiCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            // If multi-select categories provided, persist as CSV
            if (rootCauseCategories != null && rootCauseCategories.Length > 0)
            {
                var normalized = rootCauseCategories
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase);
                entity.RootCauseCategoriesCsv = string.Join(",", normalized);
                _logger.LogInformation("RootCauseCategoriesCsv set to: {Csv}", entity.RootCauseCategoriesCsv);
            }

            // Generate DFI code when absent
            if (string.IsNullOrWhiteSpace(entity.DfiCode))
            {
                entity.DfiCode = await GenerateDfiCodeAsync();
                _logger.LogInformation("Generated DFI code: {Code}", entity.DfiCode);
            }

            // Save attachment if provided
            if (attachment != null && attachment.Length > 0)
            {
                var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "nonconformities");
                Directory.CreateDirectory(uploadsRoot);
                var safeFileName = Path.GetFileNameWithoutExtension(attachment.FileName);
                var ext = Path.GetExtension(attachment.FileName);
                var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid().ToString("N").Substring(0,8)}{ext}";
                var fullPath = Path.Combine(uploadsRoot, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }
                // Store relative path to serve via static files
                entity.AttachmentPath = $"/uploads/nonconformities/{fileName}";
                _logger.LogInformation("Saved attachment to {Path}", entity.AttachmentPath);
            }

            _db.NonConformityFollowUps.Add(entity);
            var saved = await _db.SaveChangesAsync();
            _logger.LogInformation("Saved entity NonConformityFollowUp with Id={Id}, affected={Count}", entity.Id, saved);
            return Created($"api/nonconformities/{entity.Id}", entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateWithUpload failed: {Message}", ex.Message);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private async Task<string> GenerateDfiCodeAsync()
    {
        // Format: DFİ-dd-MM-yyyy-xxx (xxx: 001, 002 ... for the day)
        var today = DateTime.UtcNow.Date;
        var prefix = $"DFİ-{today:dd-MM-yyyy}-";
        var countToday = await _db.NonConformityFollowUps
            .AsNoTracking()
            .CountAsync(x => x.DfiCode != null && x.DfiCode.StartsWith(prefix));
        var seq = countToday + 1;
        return $"{prefix}{seq.ToString("D3")}";
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] NonConformityFollowUp dto)
    {
        try
        {
            var item = await _db.NonConformityFollowUps.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return NotFound();

            item.IsgReportId = dto.IsgReportId;
            item.ObservationId = dto.ObservationId;
            item.IncidentId = dto.IncidentId;
            item.NonConformityDescription = string.IsNullOrWhiteSpace(dto.NonConformityDescription) ? item.NonConformityDescription : dto.NonConformityDescription;
            item.RootCauseCategory = dto.RootCauseCategory;
            item.RootCauseDetails = dto.RootCauseDetails;
            item.PlannedCorrectiveActions = dto.PlannedCorrectiveActions;
            item.PreventiveImprovements = dto.PreventiveImprovements;
            item.TrackingRequired = dto.TrackingRequired;
            item.TrackingExplanation = dto.TrackingExplanation;
            // update CSV multi-categories if provided
            if (!string.IsNullOrWhiteSpace(dto.RootCauseCategoriesCsv))
            {
                item.RootCauseCategoriesCsv = dto.RootCauseCategoriesCsv;
            }
            item.Status = dto.Status;
            item.TargetDate = dto.TargetDate;
            item.AssignedToPersonName = dto.AssignedToPersonName;
            item.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var item = await _db.NonConformityFollowUps.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return NotFound();
            
            _db.NonConformityFollowUps.Remove(item);
            await _db.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
