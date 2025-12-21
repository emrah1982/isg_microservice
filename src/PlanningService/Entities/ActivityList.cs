namespace PlanningService.Entities;

public class ActivityList
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CompanyId { get; set; }
    public string? ActivityType { get; set; }
    public DateTime? PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? AssignedTo { get; set; }
    public string Status { get; set; } = "Planned"; // Planned, InProgress, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
