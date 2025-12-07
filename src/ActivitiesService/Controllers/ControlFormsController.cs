using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlFormsController : ControllerBase
{
    private readonly ActivitiesDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ControlFormsController(ActivitiesDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status)
    {
        var query = _db.ControlForms
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.ToLower();
            query = query.Where(c =>
                c.FormNumber.ToLower().Contains(search) ||
                c.MachineName.ToLower().Contains(search) ||
                (c.MachineModel != null && c.MachineModel.ToLower().Contains(search)) ||
                (c.Location != null && c.Location.ToLower().Contains(search))
            );
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        var data = await query
            .OrderByDescending(c => c.ControlDate)
            .ThenByDescending(c => c.Id)
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var form = await _db.ControlForms
            .Include(c => c.Attachments)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (form == null) return NotFound();
        return Ok(form);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ControlForm form)
    {
        if (string.IsNullOrWhiteSpace(form.FormNumber))
        {
            return BadRequest("Form numarası zorunludur.");
        }

        // MachineId varsa makine bilgilerini oradan çek
        if (form.MachineId.HasValue)
        {
            var machine = await _db.Machines.FindAsync(form.MachineId.Value);
            if (machine == null)
            {
                return BadRequest($"Makine bulunamadı (ID: {form.MachineId})");
            }
            // Makine bilgilerini forma kopyala (geriye dönük uyumluluk)
            form.MachineName = machine.Name;
            form.MachineModel = machine.Model;
            form.MachineSerialNumber = machine.SerialNumber;
            form.Location = machine.Location;
        }
        else if (string.IsNullOrWhiteSpace(form.MachineName))
        {
            return BadRequest("Makine adı veya MachineId zorunludur.");
        }

        // Normalize
        form.FormNumber = form.FormNumber.Trim();
        if (!string.IsNullOrWhiteSpace(form.MachineName)) form.MachineName = form.MachineName!.Trim();
        if (!string.IsNullOrWhiteSpace(form.MachineModel)) form.MachineModel = form.MachineModel!.Trim();
        if (!string.IsNullOrWhiteSpace(form.MachineSerialNumber)) form.MachineSerialNumber = form.MachineSerialNumber!.Trim();
        if (!string.IsNullOrWhiteSpace(form.Location)) form.Location = form.Location!.Trim();

        // Ensure checklist JSON is persisted (empty array if not provided)
        form.ChecklistItemsJson = string.IsNullOrWhiteSpace(form.ChecklistItemsJson) ? "[]" : form.ChecklistItemsJson;

        form.CreatedAt = DateTime.UtcNow;
        form.UpdatedAt = null;

        _db.ControlForms.Add(form);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ControlForm updated)
    {
        var existing = await _db.ControlForms.FindAsync(id);
        if (existing == null) return NotFound();

        existing.FormNumber = (updated.FormNumber ?? existing.FormNumber).Trim();
        existing.MachineName = (updated.MachineName ?? existing.MachineName).Trim();
        existing.MachineModel = string.IsNullOrWhiteSpace(updated.MachineModel) ? null : updated.MachineModel!.Trim();
        existing.MachineSerialNumber = string.IsNullOrWhiteSpace(updated.MachineSerialNumber) ? null : updated.MachineSerialNumber!.Trim();
        existing.Location = string.IsNullOrWhiteSpace(updated.Location) ? null : updated.Location!.Trim();
        existing.ControlDate = updated.ControlDate;
        existing.ControlledByPersonName = updated.ControlledByPersonName;
        existing.ControlledByPersonnelId = updated.ControlledByPersonnelId;
        existing.Status = updated.Status;
        existing.Notes = updated.Notes;
        existing.ChecklistItemsJson = string.IsNullOrWhiteSpace(updated.ChecklistItemsJson) ? existing.ChecklistItemsJson ?? "[]" : updated.ChecklistItemsJson;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var form = await _db.ControlForms.FindAsync(id);
        if (form == null) return NotFound();

        _db.ControlForms.Remove(form);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/attachments")]
    public async Task<IActionResult> UploadAttachment(int id, [FromForm] IFormFile file, [FromForm] string fileType = "Document")
    {
        var form = await _db.ControlForms.FindAsync(id);
        if (form == null) return NotFound("Kontrol formu bulunamadı.");

        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi.");

        // Dosya boyutu kontrolü (10MB)
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("Dosya boyutu 10MB'dan küçük olmalıdır.");

        var uploadsPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "control-forms");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new ControlFormAttachment
        {
            ControlFormId = id,
            FileName = file.FileName,
            StoredPath = $"/uploads/control-forms/{fileName}",
            ContentType = file.ContentType,
            FileSize = file.Length,
            FileType = fileType,
            UploadedAt = DateTime.UtcNow
        };

        _db.ControlFormAttachments.Add(attachment);
        await _db.SaveChangesAsync();

        return Ok(attachment);
    }

    [HttpDelete("attachments/{attachmentId}")]
    public async Task<IActionResult> DeleteAttachment(int attachmentId)
    {
        var attachment = await _db.ControlFormAttachments.FindAsync(attachmentId);
        if (attachment == null) return NotFound();

        // Fiziksel dosyayı sil
        var physicalPath = Path.Combine(_env.ContentRootPath, "wwwroot", attachment.StoredPath.TrimStart('/'));
        if (System.IO.File.Exists(physicalPath))
        {
            System.IO.File.Delete(physicalPath);
        }

        _db.ControlFormAttachments.Remove(attachment);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
