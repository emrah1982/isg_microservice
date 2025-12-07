using System.ComponentModel.DataAnnotations;

namespace RiskAnalysisService.DTOs;

public class RiskItemCreateDto
{
    [Required(ErrorMessage = "Risk başlığı zorunludur")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir")]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir")]
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Olasılık değeri zorunludur")]
    [Range(1, 5, ErrorMessage = "Olasılık 1-5 arasında olmalıdır")]
    public int Probability { get; set; } = 1;
    
    [Required(ErrorMessage = "Etki değeri zorunludur")]
    [Range(1, 5, ErrorMessage = "Etki 1-5 arasında olmalıdır")]
    public int Impact { get; set; } = 1;
    
    public int? OwnerUserId { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    [MaxLength(100, ErrorMessage = "Kategori en fazla 100 karakter olabilir")]
    public string? Category { get; set; }
}
