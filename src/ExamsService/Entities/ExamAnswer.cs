namespace ExamsService.Entities;

public class ExamAnswer
{
    public int Id { get; set; }
    public int AttemptId { get; set; }
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
    public bool IsCorrect { get; set; }

    public ExamAttempt? Attempt { get; set; }
}
