namespace PersonnelService.Entities;

public class PersonnelEmploymentEvent
{
    public int Id { get; set; }
    public int PersonnelId { get; set; }
    public string EventType { get; set; } = "Entry"; // Entry | Exit
    public DateTime EventDate { get; set; }
    public string? Source { get; set; } // e.g. ExcelImport
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Personnel? Personnel { get; set; }
}
