using System.ComponentModel.DataAnnotations;

namespace DocumentsService.DTOs;

public class DocumentCreateDto
{
    [Required(ErrorMessage = "Doküman başlığı zorunludur")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir")]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Kategori zorunludur")]
    [MaxLength(100, ErrorMessage = "Kategori en fazla 100 karakter olabilir")]
    public string Category { get; set; } = string.Empty;

    // New hierarchical categories (optional on create)
    [MaxLength(100)]
    public string? MainCategory { get; set; }

    [MaxLength(100)]
    public string? SubCategory { get; set; }
    
    [MaxLength(10, ErrorMessage = "Versiyon en fazla 10 karakter olabilir")]
    public string Version { get; set; } = "1.0";
    
    public DateTime? ExpiryDate { get; set; }
    
    public bool RequiresApproval { get; set; } = false;
    
    public bool IsPublic { get; set; } = false;
    
    [MaxLength(500, ErrorMessage = "Etiketler en fazla 500 karakter olabilir")]
    public string? Tags { get; set; }
}

