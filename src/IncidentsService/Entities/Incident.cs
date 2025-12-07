using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace IncidentsService.Entities;

public class Incident : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public DateTime IncidentDate { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // Kaza, Ramak Kala, Meslek Hastalığı

    [Required]
    [MaxLength(100)]
    public string Severity { get; set; } = string.Empty; // Hafif, Orta, Ağır, Ölümcül

    [MaxLength(200)]
    public string? Location { get; set; }

    public int? ReportedBy { get; set; } // UsersService referansı

    public int? InvolvedPersonId { get; set; } // UsersService referansı

    [MaxLength(100)]
    public string Status { get; set; } = "Open"; // Open, Investigating, Closed

    public DateTime? InvestigationStartDate { get; set; }

    public DateTime? InvestigationEndDate { get; set; }

    [MaxLength(2000)]
    public string? RootCause { get; set; }

    [MaxLength(2000)]
    public string? CorrectiveActions { get; set; }

    public bool RequiresReporting { get; set; } = false; // Yasal raporlama gerekli mi?

    public DateTime? ReportingDeadline { get; set; }

    public ICollection<IncidentWitness> Witnesses { get; set; } = new List<IncidentWitness>();
}
