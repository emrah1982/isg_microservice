using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PPEService.Data;

public class PpeDbContextFactory : IDesignTimeDbContextFactory<PpeDbContext>
{
    public PpeDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PpeDbContext>();
        
        // Use a design-time connection string (can be dummy for migration generation)
        var connectionString = "Server=localhost;Port=3320;Database=ppe_db;Uid=root;Pwd=isg_password_2024;AllowPublicKeyRetrieval=True;SslMode=None;";
        
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        
        return new PpeDbContext(optionsBuilder.Options);
    }
}
