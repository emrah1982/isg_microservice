namespace ActivitiesService.Entities;

public class ControlFormTemplate
{
    public int Id { get; set; }
    public string TemplateName { get; set; } = string.Empty;

    // Şablon kapsamı
    public string MachineType { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }

    // Varsayılanlar
    public string DefaultStatus { get; set; } = "Pending"; // Pending, Completed, Failed
    public string? DefaultNotes { get; set; }

    // Periyot: Daily/Weekly/Monthly/Yearly/Custom (opsiyonel)
    public string? Period { get; set; }
    // Custom seçilirse gün cinsinden periyot
    public int? PeriodDays { get; set; }

    // Checklist JSON
    public string ChecklistItemsJson { get; set; } = "[]";

    // Meta
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
