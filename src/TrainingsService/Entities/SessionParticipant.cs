using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace TrainingsService.Entities;

public class SessionParticipant : BaseEntity
{
    [Required]
    public int SessionId { get; set; }
    public TrainingSession Session { get; set; } = null!;
    
    [Required]
    public int PersonnelId { get; set; }
    
    [MaxLength(50)]
    public string AttendanceStatus { get; set; } = "Registered"; // Registered, Attended, Absent, Excused
    
    public int? Score { get; set; }
    
    public bool? Passed { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    public DateTime RegisteredDate { get; set; } = DateTime.UtcNow;
    
    public int? RegisteredBy { get; set; }
}
