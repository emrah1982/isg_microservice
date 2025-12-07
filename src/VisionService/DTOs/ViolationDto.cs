namespace VisionService.DTOs;

public class ViolationDto
{
    public string Type { get; set; } = string.Empty; // e.g., no-helmet, no-vest, smoking
    public double Confidence { get; set; } // 0-1
    public string Severity { get; set; } = "Low"; // Low | Medium | High
    public int[]? Bbox { get; set; } // [x, y, w, h] optional
    public string? Explanation { get; set; }
}
