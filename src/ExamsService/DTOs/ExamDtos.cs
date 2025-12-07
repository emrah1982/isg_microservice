using System.ComponentModel.DataAnnotations;

namespace ExamsService.DTOs;

public class OptionCreateDto
{
    [Required]
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int Order { get; set; } = 0;
}

public class QuestionCreateDto
{
    [Required]
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
    public List<OptionCreateDto> Options { get; set; } = new();
}

public class ExamCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Range(1,240)]
    public int DurationMinutes { get; set; } = 30;
    [Range(0,100)]
    public int PassScore { get; set; } = 70;
    public bool IsActive { get; set; } = true;
    public List<QuestionCreateDto> Questions { get; set; } = new();
}

public class OptionResponseDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Order { get; set; }
}

public class QuestionResponseDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public List<OptionResponseDto> Options { get; set; } = new();
}

public class ExamResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int PassScore { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<QuestionResponseDto> Questions { get; set; } = new();
}

public class ReorderItemDto
{
    public int Id { get; set; }
    public int Order { get; set; }
}

public class TrainingExamLinkDto
{
    public int TrainingId { get; set; }
    public int ExamId { get; set; }
    public int Order { get; set; } = 0;
}

public class StartAttemptDto
{
    public int UserId { get; set; }
}

public class AnswerDto
{
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
}
