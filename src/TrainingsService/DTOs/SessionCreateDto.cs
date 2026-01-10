using System.ComponentModel.DataAnnotations;

namespace TrainingsService.DTOs;

public class SessionCreateDto
{
    [Required(ErrorMessage = "Eğitim ID'si gereklidir")]
    public int TrainingId { get; set; }
    
    [Required(ErrorMessage = "Oturum tarihi gereklidir")]
    public DateTime SessionDate { get; set; }
    
    public DateTime? SessionEndDate { get; set; }
    
    [MaxLength(100)]
    public string? Branch { get; set; }
    
    [MaxLength(200)]
    public string? Location { get; set; }
    
    [MaxLength(100)]
    public string? Instructor { get; set; }
    
    [Range(0, 100, ErrorMessage = "Geçme notu 0-100 arasında olmalıdır")]
    public int? PassScore { get; set; }
    
    public int? MaxParticipants { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
}
