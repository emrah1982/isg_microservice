using System.ComponentModel.DataAnnotations;

namespace TrainingsService.DTOs;

public class TrainingCreateDto
{
    [Required(ErrorMessage = "Eğitim başlığı zorunludur")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Eğitim açıklaması zorunludur")]
    [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string Description { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Eğitim tarihi zorunludur")]
    public DateTime Date { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool Mandatory { get; set; } = false;
    
    [MaxLength(100, ErrorMessage = "Eğitmen adı en fazla 100 karakter olabilir")]
    public string? Instructor { get; set; }
    
    [MaxLength(200, ErrorMessage = "Lokasyon en fazla 200 karakter olabilir")]
    public string? Location { get; set; }
    
    [Range(1, 1440, ErrorMessage = "Süre 1-1440 dakika arasında olmalıdır")]
    public int Duration { get; set; } = 60;
    
    [Range(0, 1000, ErrorMessage = "Maksimum katılımcı sayısı 0-1000 arasında olmalıdır")]
    public int MaxParticipants { get; set; } = 0;
    
    [MaxLength(100, ErrorMessage = "Kategori en fazla 100 karakter olabilir")]
    public string? Category { get; set; }
}
