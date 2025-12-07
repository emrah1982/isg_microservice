using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ActivitiesService.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ActivitiesDbContext>
{
    public ActivitiesDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ActivitiesDbContext>();
        // Design-time: AutoDetect yerine sabit sürüm kullanarak bağlantı gereksinimini kaldırıyoruz
        var dummyConn = "server=localhost;port=3306;database=activities_db;user=root;password=dummy;TreatTinyAsBoolean=true";
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
        optionsBuilder.UseMySql(dummyConn, serverVersion);
        return new ActivitiesDbContext(optionsBuilder.Options);
    }
}
