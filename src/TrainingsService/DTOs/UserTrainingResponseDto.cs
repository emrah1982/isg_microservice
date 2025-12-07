namespace TrainingsService.DTOs;

public class UserTrainingResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty; // UsersService'den gelecek
    public string UserEmail { get; set; } = string.Empty; // UsersService'den gelecek
    public int TrainingId { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CompletionDate { get; set; }
    public int? Score { get; set; }
    public string? CertificatePath { get; set; }
    public DateTime? CertificateIssueDate { get; set; }
    public DateTime? CertificateExpiryDate { get; set; }
    public string? Notes { get; set; }
    public DateTime AssignedDate { get; set; }
    public int? AssignedBy { get; set; }
    public string? AssignedByName { get; set; } // UsersService'den gelecek
}
