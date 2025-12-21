namespace PlanningService.Entities;

public class AnnualWorkPlan
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public int Year { get; set; }
    public string? Category { get; set; }
    public int? SequenceNumber { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string? RelatedLegislation { get; set; }
    public string? ActivityDescription { get; set; }
    public string? Department { get; set; }
    public string? ResponsiblePerson { get; set; }
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public string? Budget { get; set; }
    public string? Resources { get; set; }
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string Status { get; set; } = "Planned"; // Planned, InProgress, Completed, Delayed, Cancelled
    public int? CompletionPercentage { get; set; }
    public string? Notes { get; set; }
    
    // Monthly tracking
    public bool? January { get; set; }
    public bool? February { get; set; }
    public bool? March { get; set; }
    public bool? April { get; set; }
    public bool? May { get; set; }
    public bool? June { get; set; }
    public bool? July { get; set; }
    public bool? August { get; set; }
    public bool? September { get; set; }
    public bool? October { get; set; }
    public bool? November { get; set; }
    public bool? December { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
