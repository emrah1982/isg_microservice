using Microsoft.EntityFrameworkCore;
using DocumentsService.Entities;

namespace DocumentsService.Data;

public class DocumentsDbContext : DbContext
{
    public DocumentsDbContext(DbContextOptions<DocumentsDbContext> options) : base(options)
    {
    }

    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentAccess> DocumentAccesses { get; set; }
    public DbSet<DocumentCategory> DocumentCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.MainCategory);
            entity.HasIndex(e => e.SubCategory);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ExpiryDate);

            // Map to existing SQL schema column names / ignore non-existent columns
            entity.Property(e => e.UploadedBy).HasColumnName("CreatedBy");
            entity.Ignore(e => e.ExpiryDate);
            entity.Ignore(e => e.RequiresApproval);
            entity.Ignore(e => e.ApprovedBy);
            entity.Ignore(e => e.ApprovalDate);
            entity.Ignore(e => e.Location);
            entity.Ignore(e => e.Tags);
        });

        modelBuilder.Entity<Document>().Ignore(e => e.DeletedAt);

        modelBuilder.Entity<DocumentCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MainCategory);
            entity.HasIndex(e => new { e.MainCategory, e.SubCategory });
        });

        modelBuilder.Entity<DocumentAccess>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DocumentId);
            entity.HasIndex(e => e.UserId);
            entity.HasOne(e => e.Document)
                  .WithMany(d => d.AccessPermissions)
                  .HasForeignKey(e => e.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

