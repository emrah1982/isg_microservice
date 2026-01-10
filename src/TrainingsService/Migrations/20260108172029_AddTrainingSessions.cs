using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TrainingsService.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTrainings_Status",
                table: "UserTrainings");

            migrationBuilder.DropIndex(
                name: "IX_UserTrainings_UserId",
                table: "UserTrainings");

            migrationBuilder.DropIndex(
                name: "IX_UserTrainings_UserId_TrainingId",
                table: "UserTrainings");

            migrationBuilder.DropIndex(
                name: "IX_Trainings_Category",
                table: "Trainings");

            migrationBuilder.DropIndex(
                name: "IX_Trainings_Date",
                table: "Trainings");

            migrationBuilder.DeleteData(
                table: "Trainings",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Trainings",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Trainings",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "AssignedBy",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "AssignedDate",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "CertificateExpiryDate",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "CertificateIssueDate",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "CertificatePath",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "UserTrainings");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "Mandatory",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "MaxParticipants",
                table: "Trainings");

            migrationBuilder.RenameColumn(
                name: "CompletionDate",
                table: "UserTrainings",
                newName: "CompletedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Trainings",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(1000)",
                oldMaxLength: 1000)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "TrainingType",
                table: "Trainings",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    TrainingId = table.Column<int>(type: "int", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    SessionEndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Branch = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Instructor = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PassScore = table.Column<int>(type: "int", nullable: true),
                    MaxParticipants = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_Trainings_TrainingId",
                        column: x => x.TrainingId,
                        principalTable: "Trainings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SessionParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    PersonnelId = table.Column<int>(type: "int", nullable: false),
                    AttendanceStatus = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Score = table.Column<int>(type: "int", nullable: true),
                    Passed = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RegisteredDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    RegisteredBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionParticipants_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_SessionParticipants_SessionId_PersonnelId",
                table: "SessionParticipants",
                columns: new[] { "SessionId", "PersonnelId" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_SessionDate",
                table: "TrainingSessions",
                column: "SessionDate");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_TrainingId",
                table: "TrainingSessions",
                column: "TrainingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionParticipants");

            migrationBuilder.DropTable(
                name: "TrainingSessions");

            migrationBuilder.DropColumn(
                name: "TrainingType",
                table: "Trainings");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "UserTrainings",
                newName: "CompletionDate");

            migrationBuilder.AddColumn<int>(
                name: "AssignedBy",
                table: "UserTrainings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedDate",
                table: "UserTrainings",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CertificateExpiryDate",
                table: "UserTrainings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CertificateIssueDate",
                table: "UserTrainings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificatePath",
                table: "UserTrainings",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "UserTrainings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "UserTrainings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "UserTrainings",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "UserTrainings",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Trainings",
                keyColumn: "Description",
                keyValue: null,
                column: "Description",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Trainings",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Trainings",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Trainings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Trainings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Trainings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Mandatory",
                table: "Trainings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxParticipants",
                table: "Trainings",
                type: "int",
                nullable: false,
                defaultValue: 0);

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
                name: "IX_UserTrainings_Status",
                table: "UserTrainings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_UserId",
                table: "UserTrainings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTrainings_UserId_TrainingId",
                table: "UserTrainings",
                columns: new[] { "UserId", "TrainingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_Category",
                table: "Trainings",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_Date",
                table: "Trainings",
                column: "Date");
        }
    }
}
