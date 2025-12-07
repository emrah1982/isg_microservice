using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace RiskAnalysisService.Entities;

public class RiskItem : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(1, 5)]
    public int Probability { get; set; } = 1; // 1-5

    [Range(1, 5)]
    public int Impact { get; set; } = 1; // 1-5

    public int Severity => Probability * Impact; // 1-25

    [MaxLength(50)]
    public string Status { get; set; } = "Open"; // Open, Mitigating, Closed

    public int? OwnerUserId { get; set; } // UsersService referansı

    public DateTime? DueDate { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; } // Kimyasal, Ergonomik, Mekanik vb.

    public ICollection<RiskControl> Controls { get; set; } = new List<RiskControl>();
}
