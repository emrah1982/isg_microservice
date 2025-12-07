namespace ActivitiesService.Entities;

public class PreventiveAction
{
    public int Id { get; set; }
    public int? IsgReportId { get; set; } // FK to IsgReport (opsiyonel)
    public string? ActionType { get; set; } = "Preventive"; // Faaliyet türü
    public string? Category { get; set; } = string.Empty; // Kategori (Eğitim/Prosedür/Ekipman/Çevre/vb.)
    public string Title { get; set; } = string.Empty; // Faaliyet başlığı (required)
    public string? Description { get; set; } = string.Empty; // Detaylı açıklama
    public string? Objective { get; set; } = string.Empty; // Hedef/Amaç
    public string? Priority { get; set; } = "Medium"; // Öncelik (Low/Medium/High/Critical)
    public string? Status { get; set; } = "Planned"; // Durum (Planned/InProgress/Completed/Cancelled)
    public int? AssignedToPersonnelId { get; set; } // Atanan personel
    public string? AssignedToPersonName { get; set; } = string.Empty; // Atanan kişi adı
    public int? CreatedByPersonnelId { get; set; } // Oluşturan personel
    public string? CreatedByPersonName { get; set; } = string.Empty; // Oluşturan kişi adı
    public DateTime? PlannedStartDate { get; set; } // Planlanan başlangıç tarihi
    public DateTime? PlannedCompletionDate { get; set; } // Planlanan tamamlanma tarihi
    public DateTime? ActualStartDate { get; set; } // Gerçek başlangıç tarihi
    public DateTime? ActualCompletionDate { get; set; } // Gerçek tamamlanma tarihi
    public decimal? EstimatedCost { get; set; } // Tahmini maliyet
    public decimal? ActualCost { get; set; } // Gerçek maliyet
    public string? Resources { get; set; } = string.Empty; // Gerekli kaynaklar
    public string? SuccessMetrics { get; set; } = string.Empty; // Başarı metrikleri
    public string? CompletionNotes { get; set; } = string.Empty; // Tamamlanma notları
    public string? EffectivenessEvaluation { get; set; } = string.Empty; // Etkinlik değerlendirmesi
    public bool IsRecurring { get; set; } = false; // Tekrarlanan faaliyet mi?
    public string? RecurrencePattern { get; set; } = string.Empty; // Tekrarlama deseni (Aylık/Çeyreklik/Yıllık)
    public DateTime? NextScheduledDate { get; set; } // Bir sonraki planlanan tarih
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual IsgReport? IsgReport { get; set; }
}
