using Microsoft.EntityFrameworkCore;
using TrainingsService.Entities;

namespace TrainingsService.Data;

public class TrainingsDbContext : DbContext
{
    public TrainingsDbContext(DbContextOptions<TrainingsDbContext> options) : base(options)
    {
    }
    
    public DbSet<Training> Trainings { get; set; }
    public DbSet<UserTraining> UserTrainings { get; set; }
    public DbSet<TrainingSession> TrainingSessions { get; set; }
    public DbSet<SessionParticipant> SessionParticipants { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Training configuration
        modelBuilder.Entity<Training>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Title);

            // Map only columns that exist in SQL schema (init-trainings-db.sql)
            // Available: Id, Title, Description, Duration, TrainingType, IsActive, CreatedAt, UpdatedAt, Instructor, Location, Category
            entity.Ignore(e => e.Date);
            entity.Ignore(e => e.EndDate);
            entity.Ignore(e => e.Mandatory);
            entity.Ignore(e => e.MaxParticipants);
            entity.Ignore(e => e.UserTrainings);
            
            // These fields now exist in DB, so don't ignore them
            // entity.Ignore(e => e.Instructor);
            // entity.Ignore(e => e.Location);
            // entity.Ignore(e => e.Category);
            
            // Map TrainingType enum to SQL ENUM
            entity.Property(e => e.TrainingType)
                  .HasConversion<string>()
                  .HasMaxLength(50);
        });
        
        // UserTraining configuration
        modelBuilder.Entity<UserTraining>(entity =>
        {
            entity.HasKey(e => e.Id);
            // Map only columns that exist: Id, UserId, TrainingId, CompletedAt, Score, CertificateUrl, IsCompleted, CreatedAt
            entity.Ignore(e => e.Status);
            entity.Ignore(e => e.CertificatePath); // SQL has CertificateUrl instead
            entity.Ignore(e => e.CertificateIssueDate);
            entity.Ignore(e => e.CertificateExpiryDate);
            entity.Ignore(e => e.Notes);
            entity.Ignore(e => e.AssignedDate);
            entity.Ignore(e => e.AssignedBy);
            
            // Map CompletionDate to CompletedAt
            entity.Property(e => e.CompletionDate)
                  .HasColumnName("CompletedAt");
            
            entity.HasOne(e => e.Training)
                  .WithMany(t => t.UserTrainings)
                  .HasForeignKey(e => e.TrainingId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        // BaseEntity fields - only ignore fields not present in SQL
        modelBuilder.Entity<Training>().Ignore(e => e.IsDeleted);
        modelBuilder.Entity<Training>().Ignore(e => e.DeletedAt);
        // CreatedAt and UpdatedAt exist in SQL, so don't ignore them
        
        modelBuilder.Entity<UserTraining>().Ignore(e => e.IsDeleted);
        modelBuilder.Entity<UserTraining>().Ignore(e => e.DeletedAt);

        // TrainingSession configuration
        modelBuilder.Entity<TrainingSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TrainingId);
            entity.HasIndex(e => e.SessionDate);
            
            entity.HasOne(e => e.Training)
                  .WithMany()
                  .HasForeignKey(e => e.TrainingId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        // SessionParticipant configuration
        modelBuilder.Entity<SessionParticipant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.SessionId, e.PersonnelId });
            
            entity.HasOne(e => e.Session)
                  .WithMany(s => s.Participants)
                  .HasForeignKey(e => e.SessionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data removed - using SQL script instead
    }
}
