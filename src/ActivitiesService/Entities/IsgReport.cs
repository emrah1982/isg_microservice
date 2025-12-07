namespace ActivitiesService.Entities;

public class IsgReport
{
    public int Id { get; set; }
    public string ReportNumber { get; set; } = string.Empty; // Rapor No
    public DateTime ReportDate { get; set; } // Rapor Tarihi
    public string SiteName { get; set; } = string.Empty; // Şantiye Adı
    public string Location { get; set; } = string.Empty; // Yer/Lokasyon
    public int? PersonnelId { get; set; } // Raporu hazırlayan personel
    public string PreparedBy { get; set; } = string.Empty; // Hazırlayan kişi adı
    public string WeatherCondition { get; set; } = string.Empty; // Hava Durumu
    public string WorkingConditions { get; set; } = string.Empty; // Çalışma Koşulları
    public string Notes { get; set; } = string.Empty; // Notlar
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<IsgObservation> Observations { get; set; } = new List<IsgObservation>();
    public virtual ICollection<IsgIncident> Incidents { get; set; } = new List<IsgIncident>();
    public virtual ICollection<CorrectiveAction> CorrectiveActions { get; set; } = new List<CorrectiveAction>();
    public virtual ICollection<PreventiveAction> PreventiveActions { get; set; } = new List<PreventiveAction>();
    public virtual ICollection<NonConformityFollowUp> NonConformityFollowUps { get; set; } = new List<NonConformityFollowUp>();
}

