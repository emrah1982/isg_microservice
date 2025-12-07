using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace UsersService.Entities;

public class User : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
    
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    
    [MaxLength(11)]
    public string? TcNo { get; set; }
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(100)]
    public string? Position { get; set; }
    
    public DateTime? HireDate { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime? LastLoginDate { get; set; }
}
