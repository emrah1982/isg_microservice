namespace TrainingsService.DTOs;

public class TrainingResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? EndDate { get; set; }
    public bool Mandatory { get; set; }
    public string? Instructor { get; set; }
    public string? Location { get; set; }
    public int Duration { get; set; }
    public int MaxParticipants { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public int ParticipantCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
