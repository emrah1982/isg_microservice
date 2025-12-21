namespace PlanningService.Entities;

public class CorporatePlanning
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CompanyId { get; set; }
    public string? PlanType { get; set; } // Strategic, Operational, Tactical
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Objectives { get; set; }
    public string Status { get; set; } = "Planning"; // Planning, InProgress, Completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
