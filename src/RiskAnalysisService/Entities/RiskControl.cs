using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace RiskAnalysisService.Entities;

public class RiskControl : BaseEntity
{
    [Required]
    public int RiskItemId { get; set; }
    public RiskItem RiskItem { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string Action { get; set; } = string.Empty; // Alınacak önlem

    [MaxLength(100)]
    public string? Responsible { get; set; } // Sorumlu kişi/rol

    public DateTime? TargetDate { get; set; }

    public bool Completed { get; set; } = false;

    public DateTime? CompletedDate { get; set; }
}
