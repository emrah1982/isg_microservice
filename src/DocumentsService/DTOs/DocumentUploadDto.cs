using System.ComponentModel.DataAnnotations;

namespace DocumentsService.DTOs;

public class DocumentUploadDto
{
    [Required]
    public string Base64Image { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = "VisionViolation";

    [MaxLength(100)]
    public string? MainCategory { get; set; }

    [MaxLength(100)]
    public string? SubCategory { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public bool IsPublic { get; set; } = false;

    public int? UploadedBy { get; set; }
}
