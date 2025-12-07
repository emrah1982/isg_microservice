namespace RiskAnalysisService.DTOs;

public class RiskItemResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Probability { get; set; }
    public int Impact { get; set; }
    public int Severity { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? OwnerUserId { get; set; }
    public string? OwnerName { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RiskControlResponseDto> Controls { get; set; } = new();
}
