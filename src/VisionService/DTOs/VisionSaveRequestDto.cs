using System.ComponentModel.DataAnnotations;

namespace VisionService.DTOs;

public class VisionSaveRequestDto
{
    [Required]
    public string Base64Image { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public bool IsPublic { get; set; } = false;

    public int? UploadedBy { get; set; }
}
