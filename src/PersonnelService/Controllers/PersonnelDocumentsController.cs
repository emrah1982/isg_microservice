using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;

namespace PersonnelService.Controllers;

[Route("api/[controller]")]
public class PersonnelDocumentsController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    private readonly string _uploadsPath;
    
    public PersonnelDocumentsController(PersonnelDbContext ctx, IWebHostEnvironment env) 
    { 
        _ctx = ctx; 
        _uploadsPath = Path.Combine(env.ContentRootPath, "wwwroot", "uploads", "documents");
        Directory.CreateDirectory(_uploadsPath);
    }

    /// <summary>
    /// Get all documents for a personnel
    /// </summary>
    [HttpGet("personnel/{personnelId}")]
    public async Task<IActionResult> GetPersonnelDocuments(int personnelId)
    {
        var documents = await _ctx.PersonnelDocuments
            .Where(d => d.PersonnelId == personnelId)
            .OrderBy(d => d.DocumentType)
            .ThenByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(documents);
    }

    /// <summary>
    /// Get document types and their status for a personnel
    /// </summary>
    [HttpGet("personnel/{personnelId}/status")]
    public async Task<IActionResult> GetDocumentStatus(int personnelId)
    {
        try
        {
            // Check if personnel exists
            var personnelExists = await _ctx.Personnel.AnyAsync(p => p.Id == personnelId);
            if (!personnelExists)
                return NotFound(new { message = "Personel bulunamadı" });

            var documents = await _ctx.PersonnelDocuments
                .Where(d => d.PersonnelId == personnelId)
                .Select(d => new PersonnelDocument
                {
                    Id = d.Id,
                    PersonnelId = d.PersonnelId,
                    DocumentType = d.DocumentType ?? string.Empty,
                    FileName = d.FileName ?? string.Empty,
                    StoredPath = d.StoredPath ?? string.Empty,
                    FileSize = d.FileSize,
                    ContentType = d.ContentType ?? "application/pdf",
                    IssueDate = d.IssueDate,
                    ExpiryDate = d.ExpiryDate,
                    IssuingAuthority = d.IssuingAuthority ?? string.Empty,
                    DocumentNumber = d.DocumentNumber ?? string.Empty,
                    Status = d.Status ?? "Active",
                    Notes = d.Notes ?? string.Empty,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            var status = DocumentTypes.AllTypes.Select(docType => 
            {
                var typeDocuments = documents.Where(d => d.DocumentType == docType).ToList();
                var latestDoc = typeDocuments.OrderByDescending(d => d.CreatedAt).FirstOrDefault();
                
                // A document exists if there's any document with Active, Approved, or Rejected status
                var hasDocument = typeDocuments.Any(d => !string.IsNullOrEmpty(d.Status) && 
                    (d.Status == "Active" || d.Status == "Approved" || d.Status == "Rejected"));
                
                return new
                {
                    DocumentType = docType ?? string.Empty,
                    IsRequired = DocumentTypes.RequiredDocuments.Contains(docType),
                    HasDocument = hasDocument,
                    IsExpired = typeDocuments.Any(d => d.ExpiryDate.HasValue && d.ExpiryDate < DateTime.UtcNow),
                    LatestDocument = latestDoc != null ? new
                    {
                        Id = latestDoc.Id,
                        FileName = latestDoc.FileName ?? string.Empty,
                        DocumentType = latestDoc.DocumentType ?? string.Empty,
                        Status = latestDoc.Status ?? string.Empty,
                        CreatedAt = latestDoc.CreatedAt,
                        ExpiryDate = latestDoc.ExpiryDate,
                        FileSize = latestDoc.FileSize,
                        Notes = latestDoc.Notes ?? string.Empty
                    } : null
                };
            }).ToList();

            var summary = new
            {
                PersonnelId = personnelId,
                TotalDocuments = documents.Count,
                RequiredDocuments = DocumentTypes.RequiredDocuments.Length,
                CompletedRequired = status.Count(s => s.IsRequired && s.HasDocument && !s.IsExpired),
                ExpiredDocuments = status.Count(s => s.IsExpired),
                MissingRequired = status.Where(s => s.IsRequired && (!s.HasDocument || s.IsExpired)).Select(s => s.DocumentType).ToList(),
                Documents = status
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Belge durumu alınırken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload a new document
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("Dosya seçilmedi");

        // Content type validation by document type (robust)
        var originalCt = request.File.ContentType?.ToLowerInvariant() ?? string.Empty;
        var ct = originalCt;
        var fileExtension = Path.GetExtension(request.File.FileName)?.ToLowerInvariant() ?? string.Empty;
        var type = (request.DocumentType ?? string.Empty).Trim();
        // Normalize some browsers sending generic or legacy types
        if (string.IsNullOrWhiteSpace(ct) || ct == "application/octet-stream")
        {
            // Infer from extension when content type is missing/generic
            ct = fileExtension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => ct
            };
        }

        bool isPdf = ct == "application/pdf";
        bool isJpeg = ct == "image/jpeg" || ct == "image/jpg" || ct == "image/pjpeg" || ct == "image/jfif";
        bool isPng = ct == "image/png" || ct == "image/x-png";

        // Basic logging for diagnostics
        try
        {
            Console.WriteLine($"[UploadDocument] Type='{type}', File='{request.File.FileName}', Ext='{fileExtension}', CT(original)='{originalCt}', CT(norm)='{ct}'");
        }
        catch {}

        // Determine allowed types by document type
        bool allowImage = false;
        bool allowPdf = true; // PDF is generally allowed

        if (type == DocumentTypes.DriverLicense || type == DocumentTypes.PersonnelPhoto || 
            type == DocumentTypes.IdentityCard || type == DocumentTypes.MarriageCertificate ||
            type == DocumentTypes.SpouseIdCard || type == DocumentTypes.ChildrenIdCard)
        {
            // Allow images for ID cards, photos, and personal documents
            allowImage = true;
        }
        else if (type == DocumentTypes.Certificate || type == DocumentTypes.InternalTrainingCertificate ||
                 type == DocumentTypes.ExternalTrainingCertificate || type == DocumentTypes.IsoCertificates ||
                 type == DocumentTypes.Diploma)
        {
            // Certificates and diplomas: allow both PDF and images
            allowImage = true;
        }

        if (!(isPdf && allowPdf) && !(allowImage && (isJpeg || isPng)))
        {
            return BadRequest($"Desteklenmeyen dosya türü. CT(ori)='{request.File.ContentType}', CT(norm)='{ct}', Uzantı='{fileExtension}'. PDF zorunlu; Ehliyet/Fotoğraf ve Sertifika türleri için JPG/PNG de kabul edilir.");
        }

        if (request.File.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest("Dosya boyutu 10MB'dan büyük olamaz");

        // Check if personnel exists
        var personnelExists = await _ctx.Personnel.AnyAsync(p => p.Id == request.PersonnelId);
        if (!personnelExists)
            return BadRequest("Personel bulunamadı");

        // Generate unique filename
        // Recompute to ensure not null
        fileExtension = Path.GetExtension(request.File.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_uploadsPath, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream);
        }

        // Create document record
        var document = new PersonnelDocument
        {
            PersonnelId = request.PersonnelId,
            DocumentType = request.DocumentType,
            FileName = request.File.FileName,
            StoredPath = $"uploads/documents/{uniqueFileName}",
            FileSize = request.File.Length,
            ContentType = request.File.ContentType,
            IssueDate = request.IssueDate,
            ExpiryDate = request.ExpiryDate,
            IssuingAuthority = request.IssuingAuthority?.Trim(),
            DocumentNumber = request.DocumentNumber?.Trim(),
            Notes = request.Notes?.Trim(),
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _ctx.PersonnelDocuments.Add(document);
        await _ctx.SaveChangesAsync();

        return Created($"api/personneldocuments/{document.Id}", document);
    }

    /// <summary>
    /// Download a document
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        try
        {
            var document = await _ctx.PersonnelDocuments
                .Where(d => d.Id == id)
                .Select(d => new
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType ?? "Belge",
                    FileName = d.FileName ?? "belge.pdf",
                    StoredPath = d.StoredPath ?? "",
                    ContentType = d.ContentType ?? "application/pdf",
                    FileSize = d.FileSize
                })
                .FirstOrDefaultAsync();

            if (document == null)
                return NotFound(new { message = "Belge bulunamadı" });

            // Try to find real file first
            var possiblePaths = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", document.StoredPath),
                Path.Combine(Directory.GetCurrentDirectory(), document.StoredPath),
                Path.Combine(_uploadsPath, Path.GetFileName(document.StoredPath))
            };

            foreach (var path in possiblePaths)
            {
                if (System.IO.File.Exists(path))
                {
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(path);
                    return File(fileBytes, document.ContentType, document.FileName);
                }
            }

            // If no real file found, create dummy PDF
            var dummyPdf = CreateDummyPdf(document.DocumentType, document.FileName);
            return File(dummyPdf, "application/pdf", document.FileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Dosya indirme hatası", error = ex.Message });
        }
    }

    private byte[] CreateDummyPdf(string documentType, string fileName)
    {
        // Create a simple PDF content for testing
        var pdfContent = $@"%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 700 Td
(TEST BELGE: {documentType}) Tj
0 -20 Td
(Dosya: {fileName}) Tj
0 -20 Td
(Bu bir test belgesidir.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000000400 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
470
%%EOF";

        return System.Text.Encoding.UTF8.GetBytes(pdfContent);
    }

    /// <summary>
    /// Update document status or details
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
    {
        var document = await _ctx.PersonnelDocuments.FindAsync(id);
        if (document == null)
            return NotFound();

        document.IssueDate = request.IssueDate ?? document.IssueDate;
        document.ExpiryDate = request.ExpiryDate ?? document.ExpiryDate;
        document.IssuingAuthority = request.IssuingAuthority?.Trim() ?? document.IssuingAuthority;
        document.DocumentNumber = request.DocumentNumber?.Trim() ?? document.DocumentNumber;
        document.Notes = request.Notes?.Trim() ?? document.Notes;
        document.Status = request.Status?.Trim() ?? document.Status;
        document.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return Ok(document);
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var document = await _ctx.PersonnelDocuments.FindAsync(id);
        if (document == null)
            return NotFound();

        // Delete physical file
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", document.StoredPath);
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        _ctx.PersonnelDocuments.Remove(document);
        await _ctx.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get available document types
    /// </summary>
    [HttpGet("types")]
    public IActionResult GetDocumentTypes()
    {
        try
        {
            var types = DocumentTypes.AllTypes.Select(type => new
            {
                Type = type,
                IsRequired = DocumentTypes.RequiredDocuments.Contains(type)
            }).ToList();

            return Ok(types);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Belge türleri alınırken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Test endpoint to check if PersonnelDocuments table exists
    /// </summary>
    [HttpGet("test")]
    public async Task<IActionResult> TestDatabase()
    {
        try
        {
            var count = await _ctx.PersonnelDocuments.CountAsync();
            return Ok(new { message = "PersonnelDocuments tablosu çalışıyor", count = count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "PersonnelDocuments tablosu hatası", error = ex.Message });
        }
    }

    /// <summary>
    /// Approve or reject a document
    /// </summary>
    [HttpPost("{documentId}/approve")]
    public async Task<IActionResult> ApproveDocument(int documentId, [FromBody] ApproveDocumentRequest request)
    {
        try
        {
            var document = await _ctx.PersonnelDocuments
                .Where(d => d.Id == documentId)
                .Select(d => new PersonnelDocument
                {
                    Id = d.Id,
                    PersonnelId = d.PersonnelId,
                    DocumentType = d.DocumentType ?? string.Empty,
                    FileName = d.FileName ?? string.Empty,
                    StoredPath = d.StoredPath ?? string.Empty,
                    FileSize = d.FileSize,
                    ContentType = d.ContentType ?? "application/pdf",
                    IssueDate = d.IssueDate,
                    ExpiryDate = d.ExpiryDate,
                    IssuingAuthority = d.IssuingAuthority ?? string.Empty,
                    DocumentNumber = d.DocumentNumber ?? string.Empty,
                    Status = d.Status ?? "Active",
                    Notes = d.Notes ?? string.Empty,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (document == null)
                return NotFound(new { message = "Belge bulunamadı" });

            // Update document status based on approval
            document.Status = request.Approved ? "Approved" : "Rejected";
            document.UpdatedAt = DateTime.UtcNow;
            
            // Add approval note with safe string handling
            var currentNotes = string.IsNullOrEmpty(document.Notes) ? "" : document.Notes;
            var approvalNote = $"[{DateTime.Now:dd.MM.yyyy HH:mm}] " + 
                (request.Approved ? "Onaylandı" : "Reddedildi");
            
            if (!string.IsNullOrEmpty(request.Notes))
            {
                approvalNote += $": {request.Notes}";
            }
            
            document.Notes = string.IsNullOrEmpty(currentNotes) 
                ? approvalNote 
                : currentNotes + "\n" + approvalNote;

            // Update the entity in context
            _ctx.PersonnelDocuments.Update(document);
            await _ctx.SaveChangesAsync();

            return Ok(new { 
                message = request.Approved ? "Belge onaylandı" : "Belge reddedildi",
                status = document.Status,
                updatedAt = document.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Belge onaylanırken hata oluştu", error = ex.Message });
        }
    }
}

// Request DTOs
public class UploadDocumentRequest
{
    public int PersonnelId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Notes { get; set; }
}

public class UpdateDocumentRequest
{
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Notes { get; set; }
    public string? Status { get; set; }
}

public class ApproveDocumentRequest
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}
