namespace ActivitiesService.Entities;

public class Warning
{
    public int Id { get; set; }
    public string? WarningNumber { get; set; } = string.Empty; // Uyarı numarası
    public int? PersonnelId { get; set; } // Uyarı verilen personel
    public string? PersonnelName { get; set; } = string.Empty; // Personel adı
    public string? PersonnelTcNo { get; set; } = string.Empty; // Personel TC No
    public string? PersonnelPosition { get; set; } = string.Empty; // Personel pozisyonu
    public int? CompanyId { get; set; } // Bağlı olduğu firma ID
    public string? CompanyName { get; set; } = string.Empty; // Firma adı
    public int? IssuedByPersonnelId { get; set; } // Uyarıyı veren personel
    public string? IssuedByPersonName { get; set; } = string.Empty; // Uyarıyı veren kişi adı
    public DateTime WarningDate { get; set; } // Uyarı tarihi
    public string? WarningType { get; set; } = string.Empty; // Uyarı türü (Sözlü/Yazılı/Son Uyarı)
    public string? Category { get; set; } = string.Empty; // Kategori (İSG İhlali/Disiplin/Performans/vb.)
    public string? ViolationType { get; set; } = string.Empty; // İhlal türü
    public string? Description { get; set; } = string.Empty; // Uyarı açıklaması
    public string? Location { get; set; } = string.Empty; // Olay yeri
    public DateTime? IncidentDateTime { get; set; } // Olay tarihi (uyarı tarihinden farklı olabilir)
    public string? Witnesses { get; set; } = string.Empty; // Tanıklar
    public string? ImmediateActions { get; set; } = string.Empty; // Alınan acil önlemler
    public string? ExpectedImprovement { get; set; } = string.Empty; // Beklenen iyileştirme
    public DateTime? FollowUpDate { get; set; } // Takip tarihi
    public string? FollowUpNotes { get; set; } = string.Empty; // Takip notları
    public string? Status { get; set; } = "Active"; // Durum (Active/Resolved/Escalated)
    public bool IsAcknowledged { get; set; } = false; // Personel tarafından kabul edildi mi?
    public DateTime? AcknowledgedDate { get; set; } // Kabul tarihi
    public string? PersonnelResponse { get; set; } = string.Empty; // Personelin yanıtı
    public string? AttachmentPath { get; set; } = string.Empty; // Ek dosya yolu
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
