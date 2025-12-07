namespace RiskAnalysisService.DTOs;

public class RiskControlResponseDto
{
    public int Id { get; set; }
    public int RiskItemId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Responsible { get; set; }
    public DateTime? TargetDate { get; set; }
    public bool Completed { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
