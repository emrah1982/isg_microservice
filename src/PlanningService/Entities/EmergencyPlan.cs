namespace PlanningService.Entities;

public class EmergencyPlan
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CompanyId { get; set; }
    public string? EmergencyType { get; set; } // Fire, Earthquake, Chemical, etc.
    public string? ResponsiblePerson { get; set; }
    public DateTime? PlanDate { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Active, Expired
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
