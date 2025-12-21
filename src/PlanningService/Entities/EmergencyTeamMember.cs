namespace PlanningService.Entities;

public class EmergencyTeamMember
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public string TeamType { get; set; } = string.Empty; // SearchRescue, FireFighting, FirstAid, Communication, Technical
    public int PersonnelId { get; set; }
    public string? PersonnelName { get; set; }
    public string? PersonnelTcNo { get; set; }
    public string? Role { get; set; } // TeamLeader, Member
    public string? Phone { get; set; }
    public DateTime? AssignmentDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
