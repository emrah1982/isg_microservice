namespace ExamsService.Entities;

public class TrainingExam
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public int ExamId { get; set; }
    public int Order { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Exam? Exam { get; set; }
}
