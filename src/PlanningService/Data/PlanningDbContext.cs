using Microsoft.EntityFrameworkCore;
using PlanningService.Entities;

namespace PlanningService.Data;

public class PlanningDbContext : DbContext
{
    public PlanningDbContext(DbContextOptions<PlanningDbContext> options) : base(options) { }

    public DbSet<RiskAssessment> RiskAssessments => Set<RiskAssessment>();
    public DbSet<EmergencyPlan> EmergencyPlans => Set<EmergencyPlan>();
    public DbSet<EmergencyTeamMember> EmergencyTeamMembers => Set<EmergencyTeamMember>();
    public DbSet<CorporatePlanning> CorporatePlannings => Set<CorporatePlanning>();
    public DbSet<AnnualWorkPlan> AnnualWorkPlans => Set<AnnualWorkPlan>();
    public DbSet<ActivityList> ActivityLists => Set<ActivityList>();
    public DbSet<ControlMatrix> ControlMatrices => Set<ControlMatrix>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RiskAssessment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<EmergencyPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<CorporatePlanning>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<AnnualWorkPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Category).HasMaxLength(200);
            entity.Property(e => e.ActivityName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.RelatedLegislation).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.Department).HasMaxLength(200);
            entity.Property(e => e.ResponsiblePerson).HasMaxLength(200);
            entity.Property(e => e.Budget).HasMaxLength(200);
        });

        modelBuilder.Entity<ActivityList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<ControlMatrix>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<EmergencyTeamMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TeamType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PersonnelName).HasMaxLength(200);
            entity.Property(e => e.PersonnelTcNo).HasMaxLength(11);
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(20);
        });
    }
}
