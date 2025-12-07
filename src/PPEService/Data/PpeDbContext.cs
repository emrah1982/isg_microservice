using Microsoft.EntityFrameworkCore;
using PPEService.Entities;

namespace PPEService.Data;

public class PpeDbContext : DbContext
{
    public PpeDbContext(DbContextOptions<PpeDbContext> options) : base(options) {}

    public DbSet<PpeItem> PpeItems => Set<PpeItem>();
    public DbSet<PpeAssignment> PpeAssignments => Set<PpeAssignment>();
    public DbSet<PpeIssue> PpeIssues => Set<PpeIssue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PpeItem>(e =>
        {
            e.ToTable("ppe_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Standard).HasMaxLength(120);
            e.Property(x => x.Size).HasMaxLength(40);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.StockQuantity).HasDefaultValue(0);
            e.HasIndex(x => new { x.Name, x.Size }).IsUnique(false);
        });

        modelBuilder.Entity<PpeAssignment>(e =>
        {
            e.ToTable("ppe_assignments");
            e.HasKey(x => x.Id);
            e.Property(x => x.AssignedBy).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(32).HasDefaultValue("assigned");
            e.HasIndex(x => new { x.PersonnelId, x.PpeItemId });
        });

        modelBuilder.Entity<PpeIssue>(e =>
        {
            e.ToTable("ppe_issues");
            e.HasKey(x => x.Id);
            e.Property(x => x.Notes).HasMaxLength(500);
            e.HasIndex(x => x.AssignmentId);
        });
    }
}

