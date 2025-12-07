using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController : ControllerBase
{
    private static readonly HashSet<string> AllowedMimes = new(new[] { "image/jpeg", "image/png", "image/webp" }, StringComparer.OrdinalIgnoreCase);
    private readonly ActivitiesDbContext _db;
    private readonly IWebHostEnvironment _env;

    public PhotosController(ActivitiesDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private bool IsAuthorized()
    {
        // Authorization disabled by request: allow all photo operations without API key
        return true;
    }

    [HttpGet("{entityType}/{entityId:int}")]
    public async Task<IActionResult> List(string entityType, int entityId)
    {
        if (!IsAuthorized()) return Unauthorized();
        var norm = entityType.Trim();
        var items = await _db.ActivityPhotos.AsNoTracking()
            .Where(p => p.EntityType == norm && p.EntityId == entityId)
            .OrderByDescending(p => p.Id)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("{entityType}/{entityId:int}")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB
    public async Task<IActionResult> Upload(string entityType, int entityId, [FromForm] IFormFile file, [FromForm] string? caption)
    {
        if (!IsAuthorized()) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest("Dosya yüklenmedi");
        if (!AllowedMimes.Contains(file.ContentType)) return BadRequest($"İzin verilen MIME türleri: {string.Join(", ", AllowedMimes)}");
        if (file.Length > 10 * 1024 * 1024) return BadRequest("Dosya boyutu 10MB'ı geçmemelidir");

        // Validate parent existence (best-effort based on entityType)
        var type = entityType.Trim();
        var parentExists = type.ToLower() switch
        {
            "warning" => await _db.Warnings.AnyAsync(x => x.Id == entityId),
            "communication" => await _db.Communications.AnyAsync(x => x.Id == entityId),
            "penalty" => await _db.Penalties.AnyAsync(x => x.Id == entityId),
            "correctiveaction" => await _db.CorrectiveActions.AnyAsync(x => x.Id == entityId),
            "preventiveaction" => await _db.PreventiveActions.AnyAsync(x => x.Id == entityId),
            "incident" => await _db.IsgIncidents.AnyAsync(x => x.Id == entityId),
            "observation" => await _db.IsgObservations.AnyAsync(x => x.Id == entityId),
            "report" => await _db.IsgReports.AnyAsync(x => x.Id == entityId),
            _ => false
        };
        if (!parentExists) return NotFound("İlgili kayıt bulunamadı");

        // Save file
        var safeType = type.Replace("..", string.Empty).Replace('/', '_').Replace('\\', '_');
        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", safeType, entityId.ToString());
        Directory.CreateDirectory(uploadsRoot);

        var originalName = Path.GetFileName(file.FileName);
        var ext = Path.GetExtension(originalName);
        var storedName = $"{Guid.NewGuid():N}{ext}";
        var storedPath = Path.Combine(uploadsRoot, storedName);
        await using (var stream = System.IO.File.Create(storedPath))
        {
            await file.CopyToAsync(stream);
        }

        var relPath = Path.GetRelativePath(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), storedPath)
            .Replace('\\', '/');

        var photo = new ActivityPhoto
        {
            EntityType = safeType,
            EntityId = entityId,
            FileName = originalName,
            StoredPath = relPath,
            ContentType = file.ContentType,
            FileSize = file.Length,
            Caption = string.IsNullOrWhiteSpace(caption) ? null : caption!.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _db.ActivityPhotos.Add(photo);
        await _db.SaveChangesAsync();

        return Created($"api/photos/{photo.Id}", photo);
    }

    [HttpDelete("{photoId:int}")]
    public async Task<IActionResult> Delete(int photoId)
    {
        if (!IsAuthorized()) return Unauthorized();
        var p = await _db.ActivityPhotos.FirstOrDefaultAsync(x => x.Id == photoId);
        if (p == null) return NotFound();

        // Delete physical file
        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var full = Path.Combine(root, p.StoredPath.Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(full))
        {
            try { System.IO.File.Delete(full); } catch { /* ignore */ }
        }
        _db.ActivityPhotos.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
