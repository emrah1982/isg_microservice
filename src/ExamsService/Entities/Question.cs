using System.ComponentModel.DataAnnotations;

namespace ExamsService.Entities;

public class Question
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    [Required]
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; } = 0;

    public Exam? Exam { get; set; }
    public ICollection<Option> Options { get; set; } = new List<Option>();
}
