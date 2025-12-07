namespace PPEService.Entities;

public class PpeIssue
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string Type { get; set; } = "lost"; // lost/broken/other
    public string? Notes { get; set; }
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public string? ReportedBy { get; set; }
}
