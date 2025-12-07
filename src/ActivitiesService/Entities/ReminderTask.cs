namespace ActivitiesService.Entities;

public class ReminderTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Scope
    public int? MachineId { get; set; }
    public int? ControlFormTemplateId { get; set; }

    // Schedule
    public DateTime DueDate { get; set; }
    public string? Period { get; set; } // Daily/Weekly/Monthly/Yearly/Custom
    public int? PeriodDays { get; set; }

    // State
    public string Status { get; set; } = "Open"; // Open, Completed, Skipped
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
