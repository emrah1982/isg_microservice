using System;
using System.ComponentModel.DataAnnotations;

namespace ActivitiesService.Entities
{
    public class FieldInspection
    {
        [Key]
        public int Id { get; set; }

        public int? CompanyId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(500)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string HazardTitle { get; set; } = string.Empty;

        [Required]
        public string HazardDescription { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Legislation { get; set; }

        [Required]
        public string Measures { get; set; } = string.Empty;

        [MaxLength(100)]
        public string RiskTargets { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Severity { get; set; } = 1;

        [Range(1, 5)]
        public int Likelihood { get; set; } = 1;

        public int RiskScore { get; set; }

        [MaxLength(50)]
        public string RiskLevel { get; set; } = "Dusuk";

        public string? BeforeImageUrl { get; set; }

        public string? AfterImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
