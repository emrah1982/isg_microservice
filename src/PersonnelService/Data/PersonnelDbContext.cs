using Microsoft.EntityFrameworkCore;
using PersonnelService.Entities;

namespace PersonnelService.Data;

public class PersonnelDbContext : DbContext
{
    public PersonnelDbContext(DbContextOptions<PersonnelDbContext> options) : base(options) {}

    public DbSet<Personnel> Personnel => Set<Personnel>();
    public DbSet<Title> Titles => Set<Title>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<PersonnelDocument> PersonnelDocuments => Set<PersonnelDocument>();
    public DbSet<PersonnelEmploymentEvent> PersonnelEmploymentEvents => Set<PersonnelEmploymentEvent>();
    public DbSet<BlacklistEntry> BlacklistEntries => Set<BlacklistEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Personnel>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.NationalId).HasMaxLength(11);
            e.Property(x => x.CitizenshipType).HasMaxLength(16).HasDefaultValue("TR");
            e.Property(x => x.Nationality).HasMaxLength(80);
            e.Property(x => x.ForeignIdentityNumber).HasMaxLength(30);
            e.Property(x => x.PassportNumber).HasMaxLength(30);
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.Phone).HasMaxLength(50);
            e.Property(x => x.Department).HasMaxLength(150);
            e.Property(x => x.Title).HasMaxLength(150);
            e.Property(x => x.Position).HasMaxLength(150);
            e.Property(x => x.Status).HasMaxLength(32).HasDefaultValue("Active");
            
            // Foreign key relationship with Company - Disabled for now
            // e.HasOne<Company>()
            //  .WithMany()
            //  .HasForeignKey(x => x.CompanyId)
            //  .OnDelete(DeleteBehavior.SetNull);
            
            e.HasIndex(x => x.CompanyId);
            e.HasIndex(x => x.Department);
            e.HasIndex(x => x.Title);
            e.HasIndex(x => new { x.FirstName, x.LastName });
            e.HasIndex(x => new { x.NationalId, x.Phone });
            e.HasIndex(x => x.ForeignIdentityNumber);
            e.HasIndex(x => x.PassportNumber);
            e.HasIndex(x => new { x.CitizenshipType, x.NationalId, x.ForeignIdentityNumber, x.PassportNumber });
        });

        modelBuilder.Entity<Company>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.TaxNumber).HasMaxLength(20);
            e.Property(x => x.Address).HasMaxLength(500);
            e.HasIndex(x => x.Name).IsUnique(false);
        });

        modelBuilder.Entity<Title>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<PersonnelDocument>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.DocumentType).HasMaxLength(100).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            e.Property(x => x.StoredPath).HasMaxLength(500).IsRequired();
            e.Property(x => x.ContentType).HasMaxLength(100).HasDefaultValue("application/pdf");
            e.Property(x => x.IssuingAuthority).HasMaxLength(200);
            e.Property(x => x.DocumentNumber).HasMaxLength(100);
            e.Property(x => x.Status).HasMaxLength(32).HasDefaultValue("Active");
            e.Property(x => x.Notes).HasMaxLength(1000);
            
            // Foreign key relationship
            e.HasOne(x => x.Personnel)
             .WithMany()
             .HasForeignKey(x => x.PersonnelId)
             .OnDelete(DeleteBehavior.Cascade);
            
            // Indexes
            e.HasIndex(x => x.PersonnelId);
            e.HasIndex(x => x.DocumentType);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => new { x.PersonnelId, x.DocumentType });
        });

        modelBuilder.Entity<PersonnelEmploymentEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasMaxLength(16).IsRequired();
            e.Property(x => x.Source).HasMaxLength(64);
            e.Property(x => x.Notes).HasMaxLength(1000);

            e.HasOne(x => x.Personnel)
             .WithMany()
             .HasForeignKey(x => x.PersonnelId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => x.PersonnelId);
            e.HasIndex(x => x.EventType);
            e.HasIndex(x => x.EventDate);
            e.HasIndex(x => new { x.PersonnelId, x.EventType, x.EventDate });
        });

        modelBuilder.Entity<BlacklistEntry>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.FullName).HasMaxLength(200);
            e.Property(x => x.NationalId).HasMaxLength(11);
            e.Property(x => x.ForeignIdentityNumber).HasMaxLength(30);
            e.Property(x => x.PassportNumber).HasMaxLength(30);
            e.Property(x => x.Nationality).HasMaxLength(80);

            e.Property(x => x.Category).HasMaxLength(64).IsRequired();
            e.Property(x => x.Reason).HasMaxLength(1000).IsRequired();
            e.Property(x => x.RiskLevel).HasMaxLength(16).IsRequired();
            e.Property(x => x.Source).HasMaxLength(64);
            e.Property(x => x.DecisionNumber).HasMaxLength(64);
            e.Property(x => x.Notes).HasMaxLength(2000);

            e.HasIndex(x => x.PersonnelId);
            e.HasIndex(x => x.CompanyId);
            e.HasIndex(x => x.IsActive);
            e.HasIndex(x => x.StartDate);
            e.HasIndex(x => x.Category);
            e.HasIndex(x => x.RiskLevel);
            e.HasIndex(x => x.NationalId);
            e.HasIndex(x => x.ForeignIdentityNumber);
            e.HasIndex(x => x.PassportNumber);

            e.HasOne(x => x.Personnel)
             .WithMany()
             .HasForeignKey(x => x.PersonnelId)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
