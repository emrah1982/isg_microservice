namespace TrainingsService.DTOs;

public class SessionResponseDto
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public DateTime SessionDate { get; set; }
    public DateTime? SessionEndDate { get; set; }
    public string? Branch { get; set; }
    public string? Location { get; set; }
    public string? Instructor { get; set; }
    public int? PassScore { get; set; }
    public int? MaxParticipants { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public int ParticipantCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
