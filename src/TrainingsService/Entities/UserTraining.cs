using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace TrainingsService.Entities;

public class UserTraining : BaseEntity
{
    [Required]
    public int UserId { get; set; } // UsersService'den gelen kullanıcı ID'si
    
    [Required]
    public int TrainingId { get; set; }
    public Training Training { get; set; } = null!;
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Assigned"; // Assigned, InProgress, Completed, Failed, Cancelled
    
    public DateTime? CompletionDate { get; set; }
    
    public int? Score { get; set; } // 0-100 arası puan
    
    [MaxLength(500)]
    public string? CertificatePath { get; set; }
    
    public DateTime? CertificateIssueDate { get; set; }
    
    public DateTime? CertificateExpiryDate { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    
    public int? AssignedBy { get; set; } // Atayan kullanıcının ID'si
}
