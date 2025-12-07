using Microsoft.EntityFrameworkCore;
using RiskAnalysisService.Entities;

namespace RiskAnalysisService.Data;

public class RiskDbContext : DbContext
{
    public RiskDbContext(DbContextOptions<RiskDbContext> options) : base(options)
    {
    }

    public DbSet<RiskItem> RiskItems { get; set; }
    public DbSet<RiskControl> RiskControls { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RiskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Category);
        });

        modelBuilder.Entity<RiskControl>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RiskItemId);
            entity.HasOne(e => e.RiskItem)
                  .WithMany(r => r.Controls)
                  .HasForeignKey(e => e.RiskItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
