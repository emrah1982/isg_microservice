namespace ActivitiesService.Entities;

public class ActivityPhoto
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty; // Warning | Penalty | CorrectiveAction | PreventiveAction | Incident | Observation | Report
    public int EntityId { get; set; }
    public string FileName { get; set; } = string.Empty; // özgün dosya adı
    public string StoredPath { get; set; } = string.Empty; // wwwroot altında göreli yol
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
