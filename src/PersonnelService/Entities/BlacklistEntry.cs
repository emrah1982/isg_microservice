using System;

namespace PersonnelService.Entities;

public class BlacklistEntry
{
    public int Id { get; set; }

    // Optional link to existing personnel
    public int? PersonnelId { get; set; }
    public Personnel? Personnel { get; set; }

    // Snapshot / manual entry fields
    public int? CompanyId { get; set; }
    public string? FullName { get; set; }

    public string? NationalId { get; set; }
    public string? ForeignIdentityNumber { get; set; }
    public string? PassportNumber { get; set; }
    public string? Nationality { get; set; }

    // Real-world blacklist metadata
    public string Category { get; set; } = "General"; // e.g. Security, Discipline, Fraud, Legal
    public string Reason { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = "Medium"; // Low/Medium/High/Critical

    public string? Source { get; set; } // e.g. HR, Security, Client, Legal
    public string? DecisionNumber { get; set; }

    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
