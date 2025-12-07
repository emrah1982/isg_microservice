using System.Text.Json.Serialization;

namespace ActivitiesService.Entities;

/// <summary>
/// Kontrol formlarının uygulanması/doldurulması için kayıt tablosu
/// </summary>
public class ControlFormExecution
{
    public int Id { get; set; }
    
    /// <summary>
    /// Hangi kontrol formu şablonundan türetildiği
    /// </summary>
    public int ControlFormTemplateId { get; set; }
    
    /// <summary>
    /// Uygulama numarası (otomatik oluşturulur)
    /// </summary>
    public string ExecutionNumber { get; set; } = string.Empty;
    
    /// <summary>
    /// Hangi makineye uygulandığı
    /// </summary>
    public int? MachineId { get; set; }
    
    /// <summary>
    /// Makine bilgileri (geriye dönük uyumluluk için)
    /// </summary>
    public string? MachineName { get; set; }
    public string? MachineModel { get; set; }
    public string? MachineSerialNumber { get; set; }
    public string? Location { get; set; }
    
    /// <summary>
    /// Uygulama tarihi
    /// </summary>
    public DateTime ExecutionDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Uygulayan personel bilgileri
    /// </summary>
    public int? ExecutedByPersonnelId { get; set; }
    public string? ExecutedByPersonName { get; set; }
    
    /// <summary>
    /// Uygulama durumu
    /// </summary>
    public string Status { get; set; } = "InProgress"; // InProgress, Completed, Cancelled
    
    /// <summary>
    /// Genel notlar
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Doldurulmuş kontrol maddeleri (JSON)
    /// </summary>
    public string ChecklistResponsesJson { get; set; } = "[]";
    
    /// <summary>
    /// Toplam puan/skor (opsiyonel)
    /// </summary>
    public decimal? TotalScore { get; set; }
    
    /// <summary>
    /// Maksimum puan (opsiyonel)
    /// </summary>
    public decimal? MaxScore { get; set; }
    
    /// <summary>
    /// Başarı yüzdesi
    /// </summary>
    public decimal? SuccessPercentage { get; set; }
    
    /// <summary>
    /// Kritik hatalar var mı?
    /// </summary>
    public bool HasCriticalIssues { get; set; } = false;
    
    /// <summary>
    /// Tamamlanma tarihi
    /// </summary>
    public DateTime? CompletedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation Properties
    [JsonIgnore]
    public ControlFormTemplate? ControlFormTemplate { get; set; }
    
    [JsonIgnore]
    public Machine? Machine { get; set; }
    
    public List<ControlFormExecutionAttachment> Attachments { get; set; } = new();
}

/// <summary>
/// Kontrol formu uygulama ekleri
/// </summary>
public class ControlFormExecutionAttachment
{
    public int Id { get; set; }
    public int ControlFormExecutionId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoredPath { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public string FileType { get; set; } = "Document"; // Document, Image, Video
    public string? Description { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    [JsonIgnore]
    public ControlFormExecution ControlFormExecution { get; set; } = null!;
}

/// <summary>
/// Kontrol maddesi cevabı (ChecklistResponsesJson içinde kullanılacak)
/// </summary>
public class ChecklistResponse
{
    public int ItemId { get; set; }
    public string ItemText { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public string ResponseType { get; set; } = "checkbox"; // checkbox, text, number, select
    
    // Cevap değerleri
    public bool? BooleanValue { get; set; }
    public string? TextValue { get; set; }
    public decimal? NumberValue { get; set; }
    public string? SelectValue { get; set; }
    
    // Ek bilgiler
    public string? Notes { get; set; }
    public bool IsCompliant { get; set; } = true; // Uygunluk durumu
    public bool IsCritical { get; set; } = false; // Kritik madde mi?
    public decimal? Score { get; set; } // Puan (opsiyonel)
    public DateTime ResponseDate { get; set; } = DateTime.UtcNow;
}
