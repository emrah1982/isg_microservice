using System.ComponentModel.DataAnnotations;

namespace TrainingsService.DTOs;

public class SessionParticipantDto
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public int PersonnelId { get; set; }
    public string AttendanceStatus { get; set; } = "Registered";
    public int? Score { get; set; }
    public bool? Passed { get; set; }
    public string? Notes { get; set; }
    public DateTime RegisteredDate { get; set; }
    public int? RegisteredBy { get; set; }
}

public class AssignParticipantsDto
{
    [Required(ErrorMessage = "Katılımcı listesi gereklidir")]
    [MinLength(1, ErrorMessage = "En az bir katılımcı seçilmelidir")]
    public List<int> ParticipantIds { get; set; } = new();
    
    public DateTime? TrainingDate { get; set; }
}

public class UpdatePassScoreDto
{
    [Required(ErrorMessage = "Geçme notu gereklidir")]
    [Range(0, 100, ErrorMessage = "Geçme notu 0-100 arasında olmalıdır")]
    public int PassScore { get; set; }
}
