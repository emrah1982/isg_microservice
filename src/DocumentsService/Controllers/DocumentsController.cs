using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocumentsService.Data;
using DocumentsService.DTOs;
using DocumentsService.Entities;
using Shared.DTOs;
using System.Text.RegularExpressions;

namespace DocumentsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly DocumentsDbContext _context;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(DocumentsDbContext context, ILogger<DocumentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocumentResponse>>>> GetAll()
    {
        try
        {
            var items = await _context.Documents
                .AsNoTracking()
                .OrderByDescending(d => d.CreatedAt)
                .Select(entity => new DocumentResponse
                {
                    Id = entity.Id,
                    Title = entity.Title,
                    Description = entity.Description,
                    Category = entity.Category,
                    MainCategory = entity.MainCategory,
                    SubCategory = entity.SubCategory,
                    FilePath = entity.FilePath,
                    FileType = entity.FileType,
                    FileSize = entity.FileSize,
                    Version = entity.Version,
                    Status = entity.Status,
                    IsPublic = entity.IsPublic,
                    CreatedAt = entity.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<DocumentResponse>>.SuccessResponse(items));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dokümanları listeleme hatası");
            return StatusCode(500, ApiResponse<IEnumerable<DocumentResponse>>.ErrorResponse($"Listeleme hatası: {ex.Message}"));
        }
    }

    [HttpPost("uploadBase64")]
    public async Task<ActionResult<ApiResponse<DocumentResponse>>> UploadBase64([FromBody] DocumentUploadDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<DocumentResponse>.ErrorResponse("Geçersiz veri", errors));
            }

            // Decode base64 (may come as data URL)
            var (bytes, extension, mime) = DecodeBase64Image(dto.Base64Image);

            // Ensure storage directory
            var storageDir = Path.Combine(Directory.GetCurrentDirectory(), "storage");
            if (!Directory.Exists(storageDir)) Directory.CreateDirectory(storageDir);

            var fileName = $"doc_{DateTime.UtcNow:yyyyMMdd_HHmmss_fff}.{extension}";
            var filePath = Path.Combine(storageDir, fileName);
            await System.IO.File.WriteAllBytesAsync(filePath, bytes);

            var entity = new Document
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                MainCategory = dto.MainCategory,
                SubCategory = dto.SubCategory,
                FilePath = $"/storage/{fileName}",
                FileType = mime,
                FileSize = bytes.LongLength,
                Version = "1.0",
                UploadedBy = dto.UploadedBy,
                Location = dto.Location,
                Status = "Approved", // optionally workflow later
                IsPublic = dto.IsPublic,
                Tags = null
            };

            _context.Documents.Add(entity);
            await _context.SaveChangesAsync();

            var response = new DocumentResponse
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                Category = entity.Category,
                MainCategory = entity.MainCategory,
                SubCategory = entity.SubCategory,
                FilePath = entity.FilePath,
                FileType = entity.FileType,
                FileSize = entity.FileSize,
                Version = entity.Version,
                UploadedBy = entity.UploadedBy,
                UploadedByName = null,
                ExpiryDate = entity.ExpiryDate,
                RequiresApproval = entity.RequiresApproval,
                ApprovedBy = entity.ApprovedBy,
                ApprovedByName = null,
                ApprovalDate = entity.ApprovalDate,
                Status = entity.Status,
                IsPublic = entity.IsPublic,
                Tags = entity.Tags,
                CreatedAt = entity.CreatedAt
            };

            return Ok(ApiResponse<DocumentResponse>.SuccessResponse(response, "Doküman yüklendi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Base64 doküman yükleme hatası");
            return StatusCode(500, ApiResponse<DocumentResponse>.ErrorResponse($"Yükleme hatası: {ex.Message}"));
        }
    }

    private static (byte[] Bytes, string Extension, string Mime) DecodeBase64Image(string base64)
    {
        string pattern = @"^data:(?<mime>[^;]+);base64,(?<data>.*)$";
        var match = Regex.Match(base64, pattern);
        string mime;
        string data;
        if (match.Success)
        {
            mime = match.Groups["mime"].Value;
            data = match.Groups["data"].Value;
        }
        else
        {
            mime = "application/octet-stream"; // default
            data = base64;
        }

        var bytes = Convert.FromBase64String(data);
        var ext = mime switch
        {
            // Images
            "image/jpeg" => "jpg",
            "image/jpg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            // Documents
            "application/pdf" => "pdf",
            "application/msword" => "doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => "docx",
            "application/vnd.ms-powerpoint" => "ppt",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" => "pptx",
            "application/vnd.ms-excel" => "xls",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => "xlsx",
            _ => "bin"
        };
        return (bytes, ext, mime);
    }

    public class DocumentResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? MainCategory { get; set; }
        public string? SubCategory { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string? FileType { get; set; }
        public long FileSize { get; set; }
        public string Version { get; set; } = string.Empty;
        public int? UploadedBy { get; set; }
        public string? UploadedByName { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool RequiresApproval { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public string? Tags { get; set; }
        public string? Location { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
