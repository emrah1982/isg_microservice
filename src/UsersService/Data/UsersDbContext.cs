using Microsoft.EntityFrameworkCore;
using UsersService.Entities;

namespace UsersService.Data;

public class UsersDbContext : DbContext
{
    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.TcNo).IsUnique();
            
            entity.HasOne(e => e.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(e => e.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });
        
        // Seed data
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Sistem Yöneticisi", CreatedAt = DateTime.UtcNow },
            new Role { Id = 2, Name = "Manager", Description = "İSG Uzmanı/Yönetici", CreatedAt = DateTime.UtcNow },
            new Role { Id = 3, Name = "Supervisor", Description = "Vardiya Amiri/Supervisor", CreatedAt = DateTime.UtcNow },
            new Role { Id = 4, Name = "Employee", Description = "Çalışan", CreatedAt = DateTime.UtcNow },
            new Role { Id = 5, Name = "Doctor", Description = "İşyeri Hekimi", CreatedAt = DateTime.UtcNow },
            new Role { Id = 6, Name = "Inspector", Description = "İSG Denetçisi", CreatedAt = DateTime.UtcNow }
        );
    }
}
