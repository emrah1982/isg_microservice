using System.ComponentModel.DataAnnotations;

namespace IncidentsService.DTOs;

public class IncidentCreateDto
{
    [Required(ErrorMessage = "Olay başlığı zorunludur")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir")]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir")]
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Olay tarihi zorunludur")]
    public DateTime IncidentDate { get; set; }
    
    [Required(ErrorMessage = "Olay türü zorunludur")]
    [MaxLength(100, ErrorMessage = "Tür en fazla 100 karakter olabilir")]
    public string Type { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Şiddet derecesi zorunludur")]
    [MaxLength(100, ErrorMessage = "Şiddet derecesi en fazla 100 karakter olabilir")]
    public string Severity { get; set; } = string.Empty;
    
    [MaxLength(200, ErrorMessage = "Lokasyon en fazla 200 karakter olabilir")]
    public string? Location { get; set; }
    
    public int? InvolvedPersonId { get; set; }
    
    [MaxLength(2000, ErrorMessage = "Kök neden en fazla 2000 karakter olabilir")]
    public string? RootCause { get; set; }
    
    [MaxLength(2000, ErrorMessage = "Düzeltici faaliyetler en fazla 2000 karakter olabilir")]
    public string? CorrectiveActions { get; set; }
    
    public bool RequiresReporting { get; set; } = false;
    
    public DateTime? ReportingDeadline { get; set; }
}
