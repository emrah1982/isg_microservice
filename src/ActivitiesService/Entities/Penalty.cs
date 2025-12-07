namespace ActivitiesService.Entities;

public class Penalty
{
    public int Id { get; set; }
    public string? PenaltyNumber { get; set; } = string.Empty; // Ceza numarası
    public int? PersonnelId { get; set; } // Ceza verilen personel
    public string? PersonnelName { get; set; } = string.Empty; // Personel adı
    public string? PersonnelTcNo { get; set; } = string.Empty; // Personel TC No
    public string? PersonnelPosition { get; set; } = string.Empty; // Personel pozisyonu
    public int? CompanyId { get; set; } // Bağlı olduğu firma ID
    public string? CompanyName { get; set; } = string.Empty; // Firma adı
    public int? IssuedByPersonnelId { get; set; } // Cezayı veren personel
    public string? IssuedByPersonName { get; set; } = string.Empty; // Cezayı veren kişi adı
    public DateTime PenaltyDate { get; set; } // Ceza tarihi
    public string? PenaltyType { get; set; } = string.Empty; // Ceza türü (Ücret Kesimi/İş Durdurma/İşten Çıkarma/vb.)
    public string? Category { get; set; } = string.Empty; // Kategori (İSG İhlali/Disiplin/Güvenlik/vb.)
    public string? ViolationType { get; set; } = string.Empty; // İhlal türü
    public string? Description { get; set; } = string.Empty; // Ceza açıklaması
    public string? Location { get; set; } = string.Empty; // Olay yeri
    public DateTime? IncidentDateTime { get; set; } // Olay tarihi
    public string? Severity { get; set; } = string.Empty; // Şiddet derecesi (Hafif/Orta/Ağır/Kritik)
    public decimal? FinancialPenalty { get; set; } // Mali ceza miktarı
    public int? SuspensionDays { get; set; } // İş durdurma gün sayısı
    public DateTime? SuspensionStartDate { get; set; } // İş durdurma başlangıç tarihi
    public DateTime? SuspensionEndDate { get; set; } // İş durdurma bitiş tarihi
    public string? LegalBasis { get; set; } = string.Empty; // Yasal dayanak
    public string? Witnesses { get; set; } = string.Empty; // Tanıklar
    public string? Evidence { get; set; } = string.Empty; // Kanıtlar
    public string? DefenseStatement { get; set; } = string.Empty; // Savunma beyanı
    public DateTime? DefenseDate { get; set; } // Savunma tarihi
    public string? DecisionReason { get; set; } = string.Empty; // Karar gerekçesi
    public string? Status { get; set; } = "Active"; // Durum (Active/Completed/Appealed/Cancelled)
    public bool IsAppealed { get; set; } = false; // İtiraz edildi mi?
    public DateTime? AppealDate { get; set; } // İtiraz tarihi
    public string? AppealReason { get; set; } = string.Empty; // İtiraz gerekçesi
    public string? AppealDecision { get; set; } = string.Empty; // İtiraz kararı
    public DateTime? AppealDecisionDate { get; set; } // İtiraz karar tarihi
    public string? AttachmentPath { get; set; } = string.Empty; // Ek dosya yolu
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
