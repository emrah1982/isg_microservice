using Microsoft.EntityFrameworkCore;
using ExamsService.Entities;

namespace ExamsService.Data;

public class ExamsDbContext : DbContext
{
    public ExamsDbContext(DbContextOptions<ExamsDbContext> options) : base(options) {}

    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<TrainingExam> TrainingExams => Set<TrainingExam>();
    public DbSet<ExamAttempt> ExamAttempts => Set<ExamAttempt>();
    public DbSet<ExamAnswer> ExamAnswers => Set<ExamAnswer>();
    public DbSet<PersonnelAssignment> PersonnelAssignments => Set<PersonnelAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Exam>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.PassScore).HasDefaultValue(70);
        });

        modelBuilder.Entity<Question>(q =>
        {
            q.HasKey(x => x.Id);
            q.Property(x => x.Order).HasDefaultValue(0);
            q.HasOne(x => x.Exam)
             .WithMany(x => x.Questions)
             .HasForeignKey(x => x.ExamId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Option>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.Order).HasDefaultValue(0);
            o.HasOne(x => x.Question)
             .WithMany(x => x.Options)
             .HasForeignKey(x => x.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TrainingExam>(te =>
        {
            te.HasKey(x => x.Id);
            te.HasIndex(x => new { x.TrainingId, x.ExamId }).IsUnique();
            te.Property(x => x.Order).HasDefaultValue(0);
            te.HasOne(x => x.Exam)
              .WithMany() // no direct navigation on Exam for TrainingExams
              .HasForeignKey(x => x.ExamId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExamAttempt>(ea =>
        {
            ea.HasKey(x => x.Id);
            ea.HasOne(x => x.Exam)
              .WithMany()
              .HasForeignKey(x => x.ExamId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExamAnswer>(ans =>
        {
            ans.HasKey(x => x.Id);
            ans.HasOne(x => x.Attempt)
               .WithMany(a => a.Answers)
               .HasForeignKey(x => x.AttemptId)
               .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PersonnelAssignment>(pa =>
        {
            pa.HasKey(x => x.Id);
            pa.Property(x => x.Status).HasMaxLength(32).HasDefaultValue("assigned");
            pa.HasIndex(x => new { x.PersonnelId, x.ExamId, x.TrainingId }).IsUnique();
        });
    }
}
