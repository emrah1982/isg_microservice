using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace TrainingsService.Entities;

public enum TrainingType
{
    Safety,
    Health,
    Emergency,
    Equipment,
    General
}

public class Training : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime Date { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool Mandatory { get; set; } = false;
    
    [MaxLength(100)]
    public string? Instructor { get; set; }
    
    [MaxLength(200)]
    public string? Location { get; set; }
    
    public int Duration { get; set; } // Dakika cinsinden
    
    public int MaxParticipants { get; set; } = 0; // 0 = sınırsız
    
    [MaxLength(100)]
    public string? Category { get; set; } // İSG, Yangın, İlk Yardım vb.
    
    public TrainingType TrainingType { get; set; } = TrainingType.General;
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<UserTraining> UserTrainings { get; set; } = new List<UserTraining>();
}
