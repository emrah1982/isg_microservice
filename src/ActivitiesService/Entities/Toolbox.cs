namespace ActivitiesService.Entities;

public class Toolbox
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? Category { get; set; }
    public string? Keywords { get; set; }
    public int? CreatedByPersonnelId { get; set; }
    public string? CreatedByPersonName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
