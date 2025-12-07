using System.ComponentModel.DataAnnotations;

namespace ExamsService.Entities;

public class Option
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    [Required]
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int Order { get; set; } = 0;

    public Question? Question { get; set; }
}
