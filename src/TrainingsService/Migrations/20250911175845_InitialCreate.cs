using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TrainingsService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Trainings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Mandatory = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Instructor = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    MaxParticipants = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trainings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTrainings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TrainingId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompletionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: true),
                    CertificatePath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CertificateIssueDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CertificateExpiryDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssignedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AssignedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTrainings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTrainings_Trainings_TrainingId",
                        column: x => x.TrainingId,
                        principalTable: "Trainings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Trainings",
                columns: new[] { "Id", "Category", "CreatedAt", "Date", "DeletedAt", "Description", "Duration", "EndDate", "Instructor", "IsActive", "IsDeleted", "Location", "Mandatory", "MaxParticipants", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "İSG", new DateTime(2025, 9, 11, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(834), new DateTime(2025, 9, 18, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(827), null, "İSG temel bilgileri, risk değerlendirmesi ve güvenlik kuralları", 240, null, "İSG Uzmanı", true, false, "Konferans Salonu", true, 50, "İş Sağlığı ve Güvenliği Temel Eğitimi", null },
                    { 2, "Yangın Güvenliği", new DateTime(2025, 9, 11, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(839), new DateTime(2025, 9, 25, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(837), null, "Yangın önleme, söndürme teknikleri ve acil durum prosedürleri", 180, null, "İtfaiye Eri", true, false, "Eğitim Merkezi", true, 30, "Yangın Güvenliği ve Acil Durum Eğitimi", null },
                    { 3, "İlk Yardım", new DateTime(2025, 9, 11, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(843), new DateTime(2025, 10, 2, 17, 58, 45, 4, DateTimeKind.Utc).AddTicks(841), null, "Temel ilk yardım teknikleri ve acil müdahale yöntemleri", 360, null, "Doktor", true, false, "Sağlık Merkezi", false, 20, "İlk Yardım Eğitimi", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_Category",
                table: "Trainings",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_Date",
                table: "Trainings",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_Title",
                table: "Trainings",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_Status",
                table: "UserTrainings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_TrainingId",
                table: "UserTrainings",
                column: "TrainingId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_UserId",
                table: "UserTrainings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_UserId_TrainingId",
                table: "UserTrainings",
                columns: new[] { "UserId", "TrainingId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTrainings");

            migrationBuilder.DropTable(
                name: "Trainings");
        }
    }
}
