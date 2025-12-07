using Microsoft.EntityFrameworkCore;
using IncidentsService.Entities;

namespace IncidentsService.Data;

public class IncidentsDbContext : DbContext
{
    public IncidentsDbContext(DbContextOptions<IncidentsDbContext> options) : base(options)
    {
    }

    public DbSet<Incident> Incidents { get; set; }
    public DbSet<IncidentWitness> IncidentWitnesses { get; set; }
    public DbSet<IncidentAction> IncidentActions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Incident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IncidentDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Severity);

            // The current MySQL schema created by init-incidents-db.sql does not include these columns
            entity.Ignore(e => e.Type);
            entity.Ignore(e => e.InvolvedPersonId);
            entity.Ignore(e => e.InvestigationStartDate);
            entity.Ignore(e => e.InvestigationEndDate);
            entity.Ignore(e => e.RootCause);
            entity.Ignore(e => e.CorrectiveActions);
            entity.Ignore(e => e.RequiresReporting);
            entity.Ignore(e => e.ReportingDeadline);
            entity.Ignore(e => e.Witnesses);
        });

        // BaseEntity fields not present in the incidents table
        modelBuilder.Entity<Incident>().Ignore(e => e.IsDeleted);
        modelBuilder.Entity<Incident>().Ignore(e => e.DeletedAt);

        modelBuilder.Entity<IncidentWitness>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IncidentId);
            entity.HasOne(e => e.Incident)
                  .WithMany(i => i.Witnesses)
                  .HasForeignKey(e => e.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IncidentAction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IncidentId);
            entity.Property(e => e.ActionDescription).IsRequired();
            entity.Property(e => e.ActionDate);
            entity.HasOne(e => e.Incident)
                  .WithMany()
                  .HasForeignKey(e => e.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

