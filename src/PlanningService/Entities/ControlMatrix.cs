namespace PlanningService.Entities;

public class ControlMatrix
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CompanyId { get; set; }
    public string? ControlType { get; set; }
    public string? Frequency { get; set; } // Daily, Weekly, Monthly, Quarterly, Annually
    public string? ResponsiblePerson { get; set; }
    public DateTime? LastCheckDate { get; set; }
    public DateTime? NextCheckDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive, Completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
