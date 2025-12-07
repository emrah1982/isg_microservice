using LegislationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Data
{
    public class LegislationDbContext : DbContext
    {
        public LegislationDbContext(DbContextOptions<LegislationDbContext> options) : base(options) { }

        public DbSet<Regulation> Regulations => Set<Regulation>();
        public DbSet<RegulationChange> RegulationChanges => Set<RegulationChange>();
        public DbSet<CompanyCompliance> CompanyCompliances => Set<CompanyCompliance>();
        public DbSet<RegulationArticle> RegulationArticles => Set<RegulationArticle>();
        public DbSet<CompanyApplicableRegulation> CompanyApplicableRegulations => Set<CompanyApplicableRegulation>();
        public DbSet<CompanyArticleCompliance> CompanyArticleCompliances => Set<CompanyArticleCompliance>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Regulation>(e =>
            {
                e.ToTable("Regulations");
                e.HasKey(x => x.Id);
                e.Property(x => x.Title).HasMaxLength(255);
                e.Property(x => x.LawNumber).HasMaxLength(50);
                e.Property(x => x.Type).HasMaxLength(50);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasMany(x => x.Changes)
                 .WithOne(x => x.Regulation!)
                 .HasForeignKey(x => x.RegulationId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RegulationChange>(e =>
            {
                e.ToTable("RegulationChanges");
                e.HasKey(x => x.Id);
            });

            modelBuilder.Entity<CompanyCompliance>(e =>
            {
                e.ToTable("CompanyCompliance");
                e.HasKey(x => x.Id);
                e.Property(x => x.ResponsiblePerson).HasMaxLength(255);
                e.Property(x => x.ComplianceStatus).HasMaxLength(50);
            });

            modelBuilder.Entity<RegulationArticle>(e =>
            {
                e.ToTable("RegulationArticles");
                e.HasKey(x => x.Id);
                e.Property(x => x.Code).HasMaxLength(100);
                e.Property(x => x.Title).HasMaxLength(255);
                e.HasOne(x => x.Regulation)
                 .WithMany()
                 .HasForeignKey(x => x.RegulationId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CompanyApplicableRegulation>(e =>
            {
                e.ToTable("CompanyApplicableRegulations");
                e.HasKey(x => x.Id);
                e.Property(x => x.Notes);
                e.HasOne(x => x.Regulation)
                 .WithMany()
                 .HasForeignKey(x => x.RegulationId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CompanyArticleCompliance>(e =>
            {
                e.ToTable("CompanyArticleCompliance");
                e.HasKey(x => x.Id);
                e.Property(x => x.ResponsiblePerson).HasMaxLength(255);
                e.Property(x => x.ComplianceStatus).HasMaxLength(50);
                e.HasOne(x => x.Article)
                 .WithMany()
                 .HasForeignKey(x => x.ArticleId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
