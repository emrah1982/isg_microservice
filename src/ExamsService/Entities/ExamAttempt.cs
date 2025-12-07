namespace ExamsService.Entities;

public class ExamAttempt
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    public int UserId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public int? Score { get; set; }
    public bool? Passed { get; set; }

    public Exam? Exam { get; set; }
    public ICollection<ExamAnswer> Answers { get; set; } = new List<ExamAnswer>();
}
