namespace ActivitiesService.Entities;

public class IsgObservation
{
    public int Id { get; set; }
    public int IsgReportId { get; set; } // FK to IsgReport
    public string ObservationType { get; set; } = string.Empty; // Gözlem Türü (Güvenli/Güvensiz)
    public string Description { get; set; } = string.Empty; // Açıklama
    public string Location { get; set; } = string.Empty; // Konum
    public string RiskLevel { get; set; } = string.Empty; // Risk Seviyesi (Düşük/Orta/Yüksek)
    public string Status { get; set; } = "Open"; // Durum (Open/Closed/InProgress)
    public int? ResponsiblePersonnelId { get; set; } // Sorumlu personel
    public string ResponsiblePersonName { get; set; } = string.Empty; // Sorumlu kişi adı
    public DateTime? DueDate { get; set; } // Hedef tamamlanma tarihi
    public DateTime? CompletedDate { get; set; } // Tamamlanma tarihi
    public string CompletionNotes { get; set; } = string.Empty; // Tamamlanma notları
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual IsgReport IsgReport { get; set; } = null!;
}
