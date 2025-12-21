namespace PlanningService.Entities;

public class RiskAssessment
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CompanyId { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public string? HazardType { get; set; } // Tehlike Türü
    public string? RiskSource { get; set; } // Risk Kaynağı
    public int? ProbabilityScore { get; set; } // Olasılık (1-5)
    public int? SeverityScore { get; set; } // Şiddet (1-5)
    public int? RiskScore { get; set; } // Risk Skoru (Olasılık x Şiddet)
    public string? RiskLevel { get; set; } // Düşük, Orta, Yüksek, Çok Yüksek
    public string? ControlMeasures { get; set; } // Kontrol Önlemleri
    public DateTime? AssessmentDate { get; set; }
    public string? AssessedBy { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, InProgress, Completed, Approved
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
