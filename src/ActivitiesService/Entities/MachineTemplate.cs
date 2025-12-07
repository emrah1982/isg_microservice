using System.Text.Json.Serialization;

namespace ActivitiesService.Entities;

public class MachineTemplate
{
    public int Id { get; set; }
    public string MachineType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    public List<MachineChecklistItem> ChecklistItems { get; set; } = new();
}

public class MachineChecklistItem
{
    public int Id { get; set; }
    public int MachineTemplateId { get; set; }
    public string ItemText { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation - Ignore to prevent circular reference (nullable for model binding)
    [JsonIgnore]
    public MachineTemplate? MachineTemplate { get; set; }
}
