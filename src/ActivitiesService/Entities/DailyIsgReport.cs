namespace ActivitiesService.Entities;

public class DailyIsgReport
{
    public int Id { get; set; }
    public DateTime ReportDate { get; set; }
    public string Shift { get; set; } = string.Empty; // morning, afternoon, night
    public string? WeatherCondition { get; set; }
    public string? CreatedBy { get; set; }
    public string? Highlights { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<DailyReportTask> Tasks { get; set; } = new List<DailyReportTask>();
    public virtual ICollection<DailyReportProduction> Productions { get; set; } = new List<DailyReportProduction>();
}

public class DailyReportTask
{
    public int Id { get; set; }
    public int DailyIsgReportId { get; set; }
    public string TaskType { get; set; } = string.Empty; // completed, planned
    public string Description { get; set; } = string.Empty;
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Responsible { get; set; }
    public string? Status { get; set; } // completed, in_progress, planned
    public string? Priority { get; set; } // high, medium, low
    public string? Category { get; set; } // safety_training, equipment_check, etc.

    // Navigation property
    public virtual DailyIsgReport DailyIsgReport { get; set; } = null!;
}

public class DailyReportProduction
{
    public int Id { get; set; }
    public int DailyIsgReportId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? SafetyMeasures { get; set; }
    public string? RiskLevel { get; set; } // high, medium, low
    public string? EquipmentUsed { get; set; }
    public int? PersonnelCount { get; set; }

    // Navigation property
    public virtual DailyIsgReport DailyIsgReport { get; set; } = null!;
}
