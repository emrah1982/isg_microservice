namespace IncidentsService.DTOs;

public class IncidentResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime IncidentDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? ReportedBy { get; set; }
    public string? ReportedByName { get; set; }
    public int? InvolvedPersonId { get; set; }
    public string? InvolvedPersonName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? InvestigationStartDate { get; set; }
    public DateTime? InvestigationEndDate { get; set; }
    public string? RootCause { get; set; }
    public string? CorrectiveActions { get; set; }
    public bool RequiresReporting { get; set; }
    public DateTime? ReportingDeadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<IncidentWitnessResponseDto> Witnesses { get; set; } = new();
}
