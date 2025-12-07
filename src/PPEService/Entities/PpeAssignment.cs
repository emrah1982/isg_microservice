namespace PPEService.Entities;

public class PpeAssignment
{
    public int Id { get; set; }
    public int PersonnelId { get; set; }
    public int PpeItemId { get; set; }
    public int Quantity { get; set; } = 1;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
    public string Status { get; set; } = "assigned"; // assigned/returned/lost/broken
    public DateTime? DueDate { get; set; }
    public DateTime? ReturnedAt { get; set; }
}
