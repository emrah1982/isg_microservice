namespace ActivitiesService.Entities;

public class IsgIncident
{
    public int Id { get; set; }
    public int IsgReportId { get; set; } // FK to IsgReport
    public string IncidentType { get; set; } = string.Empty; // Olay Türü (Kaza/Ramak Kala/İhlal)
    public string Severity { get; set; } = string.Empty; // Şiddet (Hafif/Orta/Ağır/Ölümcül)
    public string Description { get; set; } = string.Empty; // Olay açıklaması
    public string Location { get; set; } = string.Empty; // Olay yeri
    public DateTime IncidentDateTime { get; set; } // Olay tarihi ve saati
    public int? AffectedPersonnelId { get; set; } // Etkilenen personel
    public string AffectedPersonName { get; set; } = string.Empty; // Etkilenen kişi adı
    public string InjuryType { get; set; } = string.Empty; // Yaralanma türü
    public string ImmediateActions { get; set; } = string.Empty; // Alınan acil önlemler
    public string RootCause { get; set; } = string.Empty; // Kök neden analizi
    public string Status { get; set; } = "Open"; // Durum (Open/UnderInvestigation/Closed)
    public int? InvestigatorId { get; set; } // Araştırmacı personel
    public string InvestigatorName { get; set; } = string.Empty; // Araştırmacı adı
    public DateTime? InvestigationCompletedDate { get; set; } // Araştırma tamamlanma tarihi
    public string FinalReport { get; set; } = string.Empty; // Nihai rapor
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual IsgReport IsgReport { get; set; } = null!;
}
