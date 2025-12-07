namespace IncidentsService.DTOs;

public class IncidentWitnessResponseDto
{
    public int Id { get; set; }
    public int IncidentId { get; set; }
    public int? WitnessUserId { get; set; }
    public string? WitnessName { get; set; }
    public string? WitnessContact { get; set; }
    public string? Statement { get; set; }
    public DateTime? StatementDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
