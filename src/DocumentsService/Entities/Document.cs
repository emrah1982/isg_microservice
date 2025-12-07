using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace DocumentsService.Entities;

public class Document : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // İSG Politikası, Prosedür, Talimat, Sertifika vb.

    // New hierarchical categorization
    [MaxLength(100)]
    public string? MainCategory { get; set; } // Örn: "Talimatlar", "Prosedürler", "Formlar"

    [MaxLength(100)]
    public string? SubCategory { get; set; } // Örn: "Kalıpçı", "Elektrik", "Kaynak"

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? FileType { get; set; } // PDF, DOC, XLS vb.

    public long FileSize { get; set; } // Byte cinsinden

    [MaxLength(10)]
    public string Version { get; set; } = "1.0";

    public int? UploadedBy { get; set; } // UsersService referansı

    public DateTime? ExpiryDate { get; set; }

    public bool RequiresApproval { get; set; } = false;

    public int? ApprovedBy { get; set; } // UsersService referansı

    public DateTime? ApprovalDate { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; } // Görüntünün çekildiği lokasyon

    [MaxLength(50)]
    public string Status { get; set; } = "Draft"; // Draft, Pending, Approved, Expired

    public bool IsPublic { get; set; } = false;

    [MaxLength(500)]
    public string? Tags { get; set; } // Virgülle ayrılmış etiketler

    public ICollection<DocumentAccess> AccessPermissions { get; set; } = new List<DocumentAccess>();
}

