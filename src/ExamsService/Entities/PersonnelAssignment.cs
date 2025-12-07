namespace ExamsService.Entities;

public class PersonnelAssignment
{
    public int Id { get; set; }
    public int PersonnelId { get; set; } // TODO: integrate with PersonnelService; for now assumed to map to UsersService.Id
    public int ExamId { get; set; }
    public int? TrainingId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
    public string Status { get; set; } = "assigned"; // assigned/completed/cancelled
}
