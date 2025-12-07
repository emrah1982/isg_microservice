using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PersonnelService.Data;

var builder = WebApplication.CreateBuilder(args);

// Add detailed logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddDbContext<PersonnelDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("DefaultConnection")
             ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
             ?? "Server=localhost;Port=3313;Database=personnel_db;Uid=root;Pwd=isg_password_2024;AllowPublicKeyRetrieval=True;SslMode=None;";
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "PersonnelService", Version = "v1" }));

// CORS (named policy is more reliable across environments)
const string OpenCors = "Open";
builder.Services.AddCors(options =>
{
    options.AddPolicy(OpenCors, policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Create uploads directory
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads", "documents");
Directory.CreateDirectory(uploadsPath);

// Order: CORS before endpoints
app.UseCors(OpenCors);
app.UseStaticFiles(); // Enable static file serving
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok("OK"));

app.MapControllers().RequireCors(OpenCors);

// Ensure DB exists
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PersonnelDbContext>();
    await db.Database.MigrateAsync();

    try
    {
        // Create Companies table if not exists (match EF default table name)
        await db.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS `Companies` (
              `Id` INT NOT NULL AUTO_INCREMENT,
              `Name` VARCHAR(200) NOT NULL,
              `TaxNumber` VARCHAR(20) NULL,
              `Address` VARCHAR(500) NULL,
              `CreatedAt` DATETIME(6) NOT NULL,
              `UpdatedAt` DATETIME(6) NOT NULL,
              PRIMARY KEY (`Id`),
              KEY `IX_Companies_Name` (`Name`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        // Add CompanyId to Personnel table if missing
        await db.Database.ExecuteSqlRawAsync(@"
            SET @col_exists := (
              SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Personnel' AND COLUMN_NAME = 'CompanyId'
            );
            SET @ddl := IF(@col_exists = 0, 'ALTER TABLE `Personnel` ADD COLUMN `CompanyId` INT NULL, ADD INDEX `IX_Personnel_CompanyId` (`CompanyId`);', 'SELECT 1');
            PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        ");

        // FK constraint disabled for now - using application-level validation instead
        // try
        // {
        //     // Önce mevcut constraint'i kaldır
        //     await db.Database.ExecuteSqlRawAsync(@"ALTER TABLE `Personnel` DROP FOREIGN KEY `FK_Personnel_Companies_CompanyId`;");
        // }
        // catch { /* ignore if not exists */ }
        
        // try
        // {
        //     // Doğru tablo adı ile yeniden oluştur
        //     await db.Database.ExecuteSqlRawAsync(@"ALTER TABLE `Personnel` ADD CONSTRAINT `FK_Personnel_Companies_CompanyId` FOREIGN KEY (`CompanyId`) REFERENCES `Companies`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;");
        // }
        // catch (Exception ex) 
        // { 
        //     Console.WriteLine($"FK constraint creation error: {ex.Message}");
        // }

        // Create PersonnelDocuments table if not exists
        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS `PersonnelDocuments` (
                  `Id` INT NOT NULL AUTO_INCREMENT,
                  `PersonnelId` INT NOT NULL,
                  `DocumentType` VARCHAR(100) NOT NULL,
                  `FileName` VARCHAR(255) NOT NULL,
                  `StoredPath` VARCHAR(500) NOT NULL,
                  `FileSize` BIGINT NOT NULL,
                  `ContentType` VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
                  `IssueDate` DATETIME(6) NULL,
                  `ExpiryDate` DATETIME(6) NULL,
                  `IssuingAuthority` VARCHAR(200) NULL,
                  `DocumentNumber` VARCHAR(100) NULL,
                  `Status` VARCHAR(32) NOT NULL DEFAULT 'Active',
                  `Notes` VARCHAR(1000) NULL,
                  `CreatedAt` DATETIME(6) NOT NULL,
                  `UpdatedAt` DATETIME(6) NOT NULL,
                  PRIMARY KEY (`Id`),
                  KEY `IX_PersonnelDocuments_PersonnelId` (`PersonnelId`),
                  KEY `IX_PersonnelDocuments_DocumentType` (`DocumentType`),
                  KEY `IX_PersonnelDocuments_Status` (`Status`),
                  KEY `IX_PersonnelDocuments_PersonnelId_DocumentType` (`PersonnelId`, `DocumentType`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
            
            // Add foreign key constraint separately (best-effort)
            try
            {
                await db.Database.ExecuteSqlRawAsync(@"
                    ALTER TABLE `PersonnelDocuments` 
                    ADD CONSTRAINT `FK_PersonnelDocuments_Personnel_PersonnelId` 
                    FOREIGN KEY (`PersonnelId`) REFERENCES `Personnel`(`Id`) ON DELETE CASCADE;
                ");
            }
            catch { /* ignore if FK already exists */ }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"PersonnelDocuments table creation error: {ex.Message}");
        }

        // Clean and recreate PersonnelDocuments with proper data
        await db.Database.ExecuteSqlRawAsync(@"DELETE FROM `PersonnelDocuments`;");
        
        // Insert test documents with proper NULL handling
        await db.Database.ExecuteSqlRawAsync(@"
            INSERT INTO `PersonnelDocuments` 
            (`PersonnelId`, `DocumentType`, `FileName`, `StoredPath`, `FileSize`, `ContentType`, `IssueDate`, `ExpiryDate`, `IssuingAuthority`, `DocumentNumber`, `Status`, `Notes`, `CreatedAt`, `UpdatedAt`) 
            VALUES 
            (1, 'Sabıka Kaydı', 'sabika_kaydi.pdf', 'uploads/documents/sabika_kaydi.pdf', 1024000, 'application/pdf', '2024-01-15', '2025-01-15', 'Emniyet Müdürlüğü', 'SK-2024-001', 'Active', 'Test sabıka kaydı belgesi', NOW(6), NOW(6)),
            (1, 'Diploma', 'diploma.pdf', 'uploads/documents/diploma.pdf', 2048000, 'application/pdf', '2020-06-30', NULL, 'İstanbul Üniversitesi', 'DIP-2020-123', 'Active', 'Bilgisayar Mühendisliği Diploması', NOW(6), NOW(6)),
            (1, 'Sağlık Raporu', 'saglik_raporu.pdf', 'uploads/documents/saglik_raporu.pdf', 512000, 'application/pdf', '2024-09-01', '2025-09-01', 'Devlet Hastanesi', 'SR-2024-456', 'Active', 'Genel sağlık raporu', NOW(6), NOW(6));
        ");

        // Optional: seed default companies if not exist
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Varsayılan Firma', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies`);");
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Limak Holding', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies` WHERE `Name`='Limak Holding');");
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Cengiz Holding', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies` WHERE `Name`='Cengiz Holding');");
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Kalyon Holding', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies` WHERE `Name`='Kalyon Holding');");
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Kolin İnşaat', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies` WHERE `Name`='Kolin İnşaat');");
        await db.Database.ExecuteSqlRawAsync(@"INSERT INTO `Companies` (`Name`,`CreatedAt`,`UpdatedAt`) SELECT 'Makyol', NOW(6), NOW(6) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Companies` WHERE `Name`='Makyol');");
    }
    catch { /* ignore ensure errors */ }
}

await app.RunAsync();
