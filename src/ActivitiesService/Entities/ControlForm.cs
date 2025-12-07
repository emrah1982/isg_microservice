using System.Text.Json.Serialization;

namespace ActivitiesService.Entities;

public class ControlForm
{
    public int Id { get; set; }
    public string FormNumber { get; set; } = string.Empty;
    
    // Makine ilişkisi (yeni)
    public int? MachineId { get; set; }
    
    // Eski alanlar (geriye dönük uyumluluk için nullable)
    public string? MachineName { get; set; }
    public string? MachineModel { get; set; }
    public string? MachineSerialNumber { get; set; }
    public string? Location { get; set; }
    
    public DateTime ControlDate { get; set; } = DateTime.UtcNow;
    public string? ControlledByPersonName { get; set; }
    public int? ControlledByPersonnelId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed
    public string? Notes { get; set; }
    public string? ChecklistItemsJson { get; set; } // JSON array of checklist items
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    [JsonIgnore]
    public Machine? Machine { get; set; }
    public List<ControlFormAttachment> Attachments { get; set; } = new();
}

public class ControlFormAttachment
{
    public int Id { get; set; }
    public int ControlFormId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoredPath { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public string FileType { get; set; } = "Document"; // Document, Image
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ControlForm ControlForm { get; set; } = null!;
}
