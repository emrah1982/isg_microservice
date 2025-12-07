using System.ComponentModel.DataAnnotations;

namespace TrainingsService.DTOs;

public class UserTrainingAssignDto
{
    [Required(ErrorMessage = "Kullanıcı ID'si zorunludur")]
    public int UserId { get; set; }
    
    [MaxLength(500, ErrorMessage = "Notlar en fazla 500 karakter olabilir")]
    public string? Notes { get; set; }
}
