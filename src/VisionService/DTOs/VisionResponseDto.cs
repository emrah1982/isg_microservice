namespace VisionService.DTOs;

public class VisionResponseDto
{
    public List<ViolationDto> Violations { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
    public string? AnnotatedImageUrl { get; set; }
}
