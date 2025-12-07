using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocumentsService.Data;
using DocumentsService.Entities;
using Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace DocumentsService.Controllers;

[ApiController]
[Route("api/document-categories")]
public class DocumentCategoriesController : ControllerBase
{
    private readonly DocumentsDbContext _context;
    private readonly ILogger<DocumentCategoriesController> _logger;

    public DocumentCategoriesController(DocumentsDbContext context, ILogger<DocumentCategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocumentCategory>>>> GetAll([FromQuery] bool activeOnly = true)
    {
        var query = _context.DocumentCategories.AsNoTracking();
        if (activeOnly)
            query = query.Where(c => c.IsActive);
        var items = await query
            .OrderBy(c => c.MainCategory)
            .ThenBy(c => c.SubCategory)
            .ToListAsync();
        return Ok(ApiResponse<IEnumerable<DocumentCategory>>.SuccessResponse(items));
    }

    public record CategoryTreeItem(string MainCategory, List<string> SubCategories);

    [HttpGet("tree")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryTreeItem>>>> GetTree()
    {
        var items = await _context.DocumentCategories.AsNoTracking()
            .Where(c => c.IsActive)
            .ToListAsync();
        var tree = items
            .GroupBy(c => c.MainCategory)
            .OrderBy(g => g.Key)
            .Select(g => new CategoryTreeItem(
                g.Key,
                g.Where(x => x.SubCategory != null)
                 .Select(x => x.SubCategory!)
                 .Distinct()
                 .OrderBy(x => x)
                 .ToList()
            ))
            .ToList();
        return Ok(ApiResponse<IEnumerable<CategoryTreeItem>>.SuccessResponse(tree));
    }

    public class CreateCategoryDto
    {
        public string MainCategory { get; set; } = string.Empty;
        public string? SubCategory { get; set; }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DocumentCategory>>> Create([FromBody] CreateCategoryDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.MainCategory))
                return BadRequest(ApiResponse<DocumentCategory>.ErrorResponse("Ana kategori zorunludur"));

            var exists = await _context.DocumentCategories.AnyAsync(c => c.MainCategory == dto.MainCategory && c.SubCategory == dto.SubCategory);
            if (exists)
                return Conflict(ApiResponse<DocumentCategory>.ErrorResponse("Kategori zaten mevcut"));

            var entity = new DocumentCategory
            {
                MainCategory = dto.MainCategory.Trim(),
                SubCategory = string.IsNullOrWhiteSpace(dto.SubCategory) ? null : dto.SubCategory!.Trim(),
                IsActive = true
            };
            _context.DocumentCategories.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<DocumentCategory>.SuccessResponse(entity, "Kategori eklendi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kategori ekleme hatası");
            return StatusCode(500, ApiResponse<DocumentCategory>.ErrorResponse($"Ekleme hatası: {ex.Message}"));
        }
    }

    public class UpdateCategoryDto
    {
        public string MainCategory { get; set; } = string.Empty;
        public string? SubCategory { get; set; }
        public bool? IsActive { get; set; }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DocumentCategory>>> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        try
        {
            var entity = await _context.DocumentCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null)
                return NotFound(ApiResponse<DocumentCategory>.ErrorResponse("Kategori bulunamadı"));

            if (!string.IsNullOrWhiteSpace(dto.MainCategory))
                entity.MainCategory = dto.MainCategory.Trim();
            entity.SubCategory = string.IsNullOrWhiteSpace(dto.SubCategory) ? entity.SubCategory : dto.SubCategory!.Trim();
            if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

            // prevent duplicates
            var exists = await _context.DocumentCategories.AnyAsync(c => c.Id != id && c.MainCategory == entity.MainCategory && c.SubCategory == entity.SubCategory);
            if (exists)
                return Conflict(ApiResponse<DocumentCategory>.ErrorResponse("Aynı isimde kategori mevcut"));

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<DocumentCategory>.SuccessResponse(entity, "Kategori güncellendi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kategori güncelleme hatası");
            return StatusCode(500, ApiResponse<DocumentCategory>.ErrorResponse($"Güncelleme hatası: {ex.Message}"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        try
        {
            var entity = await _context.DocumentCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null)
                return NotFound(ApiResponse<bool>.ErrorResponse("Kategori bulunamadı"));

            _context.DocumentCategories.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Kategori silindi"));
        }
        catch (DbUpdateException)
        {
            // If FK relations exist in future, we can mark inactive instead of delete
            return Conflict(ApiResponse<bool>.ErrorResponse("Kategori ilişkili kayıtlar nedeniyle silinemedi. Önce pasif yapın."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kategori silme hatası");
            return StatusCode(500, ApiResponse<bool>.ErrorResponse($"Silme hatası: {ex.Message}"));
        }
    }
}
