namespace ActivitiesService.Entities;

public class NonConformityFollowUp
{
    public int Id { get; set; }

    // Bağlantılar (faaliyetlerin altında ilişkilendirme için opsiyonel FK'lar)
    public int? IsgReportId { get; set; }
    public int? ObservationId { get; set; }
    public int? IncidentId { get; set; }

    // Uygunsuzluk bilgileri
    public string NonConformityDescription { get; set; } = string.Empty; // Uygunsuzluğun Tanımı

    // Kök neden bilgileri (İnsan, Malzeme, Makine, Metot, Doğa)
    public string? RootCauseCategory { get; set; } = string.Empty; // İnsan/Malzeme/Makine/Metot/Doğa
    public string? RootCauseDetails { get; set; } = string.Empty;  // Açıklama
    // Çoklu kök neden desteği (virgül ayrılmış liste: "human,material,method")
    public string? RootCauseCategoriesCsv { get; set; } = string.Empty;

    // Düzeltici faaliyet/düzeltmeler
    public string? PlannedCorrectiveActions { get; set; } = string.Empty; // Planlanan Düzeltici Faaliyetler ve Düzeltmeler

    // Tekrarı önleyici iyileştirmeler
    public string? PreventiveImprovements { get; set; } = string.Empty; // Tekrarını önlemek için yapılacak iyileştirmeler

    // Takip gerekliliği
    public bool TrackingRequired { get; set; } = false; // Takip gerekli mi?
    public string? TrackingExplanation { get; set; } = string.Empty; // Açıklama

    // Genel izleme alanları
    public string? Status { get; set; } = "Open"; // Open/InProgress/Closed
    public DateTime? TargetDate { get; set; } // Tamamlama hedef tarihi (opsiyonel)
    public string? AssignedToPersonName { get; set; } = string.Empty; // Sorumlu kişi adı (opsiyonel)

    // Opsiyonel DÖF/Rapor kodu (DFİ-06-10-2025-xxx formatı)
    public string? DfiCode { get; set; } = string.Empty;

    // Opsiyonel resim/ek dosya yolu (server üzerinde kayıtlı path)
    public string? AttachmentPath { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual IsgReport? IsgReport { get; set; }
    public virtual IsgObservation? Observation { get; set; }
    public virtual IsgIncident? Incident { get; set; }
}
