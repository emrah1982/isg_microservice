using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace UsersService.Entities;

public class Role : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? Description { get; set; }
    
    public ICollection<User> Users { get; set; } = new List<User>();
}
