namespace ActivitiesService.Entities;

public class ControlPlan
{
    public int Id { get; set; }
    public int ControlFormTemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Period { get; set; } = "Daily"; // Daily, Weekly, Monthly, Yearly
    public int Interval { get; set; } = 1;
    public string? WeekDaysJson { get; set; }
    public int? DayOfMonth { get; set; }
    public string StartRule { get; set; } = "OnFirstApproval";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? NextRunDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ControlFormTemplate? ControlFormTemplate { get; set; }
    public ICollection<ControlPlanTarget> Targets { get; set; } = new List<ControlPlanTarget>();
}
