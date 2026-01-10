using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace TrainingsService.Entities;

public class TrainingSession : BaseEntity
{
    [Required]
    public int TrainingId { get; set; }
    public Training Training { get; set; } = null!;
    
    [Required]
    public DateTime SessionDate { get; set; }
    
    public DateTime? SessionEndDate { get; set; }
    
    [MaxLength(100)]
    public string? Branch { get; set; }
    
    [MaxLength(200)]
    public string? Location { get; set; }
    
    [MaxLength(100)]
    public string? Instructor { get; set; }
    
    public int? PassScore { get; set; }
    
    public int? MaxParticipants { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<SessionParticipant> Participants { get; set; } = new List<SessionParticipant>();
}
