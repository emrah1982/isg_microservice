using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace DocumentsService.Entities;

public class DocumentAccess : BaseEntity
{
    [Required]
    public int DocumentId { get; set; }
    public Document Document { get; set; } = null!;

    public int? UserId { get; set; } // UsersService referansı

    public int? RoleId { get; set; } // Rol bazlı erişim

    [Required]
    [MaxLength(50)]
    public string AccessType { get; set; } = "Read"; // Read, Write, Admin

    public DateTime? AccessGrantedDate { get; set; } = DateTime.UtcNow;

    public DateTime? AccessExpiryDate { get; set; }
}
