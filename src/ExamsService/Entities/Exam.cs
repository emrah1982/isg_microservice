using System.ComponentModel.DataAnnotations;

namespace ExamsService.Entities;

public class Exam
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(1, 240)]
    public int DurationMinutes { get; set; } = 30;

    [Range(0,100)]
    public int PassScore { get; set; } = 70;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
