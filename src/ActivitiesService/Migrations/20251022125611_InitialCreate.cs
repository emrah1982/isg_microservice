using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ActivitiesService.Migrations
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
                name: "ActivityPhotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EntityType = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StoredPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContentType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Caption = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityPhotos", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Communications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    LetterNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SenderName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReceiverName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SentDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Medium = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Content = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Open")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AttachmentPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Communications", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlFormTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    TemplateName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Model = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SerialNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DefaultStatus = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DefaultNotes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Period = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PeriodDays = table.Column<int>(type: "int", nullable: true),
                    ChecklistItemsJson = table.Column<string>(type: "TEXT", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlFormTemplates", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DailyIsgReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ReportDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Shift = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WeatherCondition = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Highlights = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyIsgReports", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "IsgReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ReportNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReportDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    SiteName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelId = table.Column<int>(type: "int", nullable: true),
                    PreparedBy = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WeatherCondition = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WorkingConditions = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IsgReports", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Machines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineType = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Model = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SerialNumber = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ManufactureYear = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CustomChecklistJson = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Machines", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MachineTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MachineTemplates", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Penalties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PenaltyNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelId = table.Column<int>(type: "int", nullable: true),
                    PersonnelName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelTcNo = table.Column<string>(type: "varchar(11)", maxLength: 11, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelPosition = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IssuedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    IssuedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PenaltyDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PenaltyType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ViolationType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IncidentDateTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Severity = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FinancialPenalty = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SuspensionDays = table.Column<int>(type: "int", nullable: true),
                    SuspensionStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SuspensionEndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LegalBasis = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Witnesses = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Evidence = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DefenseStatement = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DefenseDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DecisionReason = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Active")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsAppealed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AppealDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AppealReason = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AppealDecision = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AppealDecisionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AttachmentPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Penalties", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReminderTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    ControlFormTemplateId = table.Column<int>(type: "int", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Period = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PeriodDays = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Open")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReminderTasks", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Toolboxes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Content = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Keywords = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    CreatedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Toolboxes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Warnings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    WarningNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelId = table.Column<int>(type: "int", nullable: true),
                    PersonnelName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelTcNo = table.Column<string>(type: "varchar(11)", maxLength: 11, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelPosition = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IssuedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    IssuedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WarningDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    WarningType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ViolationType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IncidentDateTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Witnesses = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImmediateActions = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExpectedImprovement = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FollowUpDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FollowUpNotes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Active")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsAcknowledged = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AcknowledgedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PersonnelResponse = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AttachmentPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warnings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ControlFormTemplateId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Period = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IntervalValue = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    WeekDaysJson = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DayOfMonth = table.Column<int>(type: "int", nullable: true),
                    StartRule = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "OnFirstApproval")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    NextRunDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlPlans_ControlFormTemplates_ControlFormTemplateId",
                        column: x => x.ControlFormTemplateId,
                        principalTable: "ControlFormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DailyReportProductions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DailyIsgReportId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SafetyMeasures = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RiskLevel = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EquipmentUsed = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonnelCount = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyReportProductions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyReportProductions_DailyIsgReports_DailyIsgReportId",
                        column: x => x.DailyIsgReportId,
                        principalTable: "DailyIsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DailyReportTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DailyIsgReportId = table.Column<int>(type: "int", nullable: false),
                    TaskType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StartTime = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EndTime = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Responsible = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Priority = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyReportTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyReportTasks_DailyIsgReports_DailyIsgReportId",
                        column: x => x.DailyIsgReportId,
                        principalTable: "DailyIsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "IsgIncidents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IsgReportId = table.Column<int>(type: "int", nullable: false),
                    IncidentType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Severity = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IncidentDateTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AffectedPersonnelId = table.Column<int>(type: "int", nullable: true),
                    AffectedPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InjuryType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImmediateActions = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RootCause = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Open")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InvestigatorId = table.Column<int>(type: "int", nullable: true),
                    InvestigatorName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InvestigationCompletedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FinalReport = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IsgIncidents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IsgIncidents_IsgReports_IsgReportId",
                        column: x => x.IsgReportId,
                        principalTable: "IsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "IsgObservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IsgReportId = table.Column<int>(type: "int", nullable: false),
                    ObservationType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RiskLevel = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Open")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ResponsiblePersonnelId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletionNotes = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IsgObservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IsgObservations_IsgReports_IsgReportId",
                        column: x => x.IsgReportId,
                        principalTable: "IsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PreventiveActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IsgReportId = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Preventive")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Objective = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Priority = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Medium")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Planned")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssignedToPersonnelId = table.Column<int>(type: "int", nullable: true),
                    AssignedToPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    CreatedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PlannedStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PlannedCompletionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActualCompletionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ActualCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Resources = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SuccessMetrics = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompletionNotes = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EffectivenessEvaluation = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsRecurring = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NextScheduledDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreventiveActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PreventiveActions_IsgReports_IsgReportId",
                        column: x => x.IsgReportId,
                        principalTable: "IsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlFormExecutions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ControlFormTemplateId = table.Column<int>(type: "int", nullable: false),
                    ExecutionNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    MachineName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineModel = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineSerialNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExecutionDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ExecutedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    ExecutedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "InProgress")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChecklistResponsesJson = table.Column<string>(type: "TEXT", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MaxScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SuccessPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    HasCriticalIssues = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlFormExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlFormExecutions_ControlFormTemplates_ControlFormTempla~",
                        column: x => x.ControlFormTemplateId,
                        principalTable: "ControlFormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ControlFormExecutions_Machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FormNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    MachineName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineModel = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineSerialNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ControlDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ControlledByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ControlledByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChecklistItemsJson = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlForms_Machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machines",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MachineChecklistItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineTemplateId = table.Column<int>(type: "int", nullable: false),
                    ItemText = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MachineChecklistItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MachineChecklistItems_MachineTemplates_MachineTemplateId",
                        column: x => x.MachineTemplateId,
                        principalTable: "MachineTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlPlanTargets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ControlPlanId = table.Column<int>(type: "int", nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlPlanTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlPlanTargets_ControlPlans_ControlPlanId",
                        column: x => x.ControlPlanId,
                        principalTable: "ControlPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ControlPlanTargets_Machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CorrectiveActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IsgReportId = table.Column<int>(type: "int", nullable: true),
                    ObservationId = table.Column<int>(type: "int", nullable: true),
                    IncidentId = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Corrective")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Priority = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Medium")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Planned")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssignedToPersonnelId = table.Column<int>(type: "int", nullable: true),
                    AssignedToPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedByPersonnelId = table.Column<int>(type: "int", nullable: true),
                    CreatedByPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PlannedStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PlannedCompletionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActualCompletionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ActualCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Resources = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompletionNotes = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EffectivenessEvaluation = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrectiveActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrectiveActions_IsgIncidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "IsgIncidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CorrectiveActions_IsgObservations_ObservationId",
                        column: x => x.ObservationId,
                        principalTable: "IsgObservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CorrectiveActions_IsgReports_IsgReportId",
                        column: x => x.IsgReportId,
                        principalTable: "IsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NonConformityFollowUps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IsgReportId = table.Column<int>(type: "int", nullable: true),
                    ObservationId = table.Column<int>(type: "int", nullable: true),
                    IncidentId = table.Column<int>(type: "int", nullable: true),
                    NonConformityDescription = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RootCauseCategory = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RootCauseDetails = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RootCauseCategoriesCsv = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PlannedCorrectiveActions = table.Column<string>(type: "varchar(3000)", maxLength: 3000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PreventiveImprovements = table.Column<string>(type: "varchar(3000)", maxLength: 3000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrackingRequired = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TrackingExplanation = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true, defaultValue: "Open")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TargetDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AssignedToPersonName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DfiCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AttachmentPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonConformityFollowUps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NonConformityFollowUps_IsgIncidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "IsgIncidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NonConformityFollowUps_IsgObservations_ObservationId",
                        column: x => x.ObservationId,
                        principalTable: "IsgObservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NonConformityFollowUps_IsgReports_IsgReportId",
                        column: x => x.IsgReportId,
                        principalTable: "IsgReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlFormExecutionAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ControlFormExecutionId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StoredPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContentType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FileType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Document")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploadedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlFormExecutionAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlFormExecutionAttachments_ControlFormExecutions_Contro~",
                        column: x => x.ControlFormExecutionId,
                        principalTable: "ControlFormExecutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ControlFormAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ControlFormId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StoredPath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContentType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FileType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Document")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploadedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlFormAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ControlFormAttachments_ControlForms_ControlFormId",
                        column: x => x.ControlFormId,
                        principalTable: "ControlForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityPhotos_EntityType_EntityId",
                table: "ActivityPhotos",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_Communications_PersonnelId_Status",
                table: "Communications",
                columns: new[] { "PersonnelId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Communications_SentDate",
                table: "Communications",
                column: "SentDate");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormAttachments_ControlFormId",
                table: "ControlFormAttachments",
                column: "ControlFormId");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutionAttachments_ControlFormExecutionId",
                table: "ControlFormExecutionAttachments",
                column: "ControlFormExecutionId");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutions_ControlFormTemplateId_ExecutionDate",
                table: "ControlFormExecutions",
                columns: new[] { "ControlFormTemplateId", "ExecutionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutions_ExecutionDate",
                table: "ControlFormExecutions",
                column: "ExecutionDate");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutions_ExecutionNumber",
                table: "ControlFormExecutions",
                column: "ExecutionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutions_MachineId",
                table: "ControlFormExecutions",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormExecutions_Status",
                table: "ControlFormExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ControlForms_ControlDate",
                table: "ControlForms",
                column: "ControlDate");

            migrationBuilder.CreateIndex(
                name: "IX_ControlForms_FormNumber",
                table: "ControlForms",
                column: "FormNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ControlForms_MachineId",
                table: "ControlForms",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "IX_ControlForms_Status",
                table: "ControlForms",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormTemplates_MachineType",
                table: "ControlFormTemplates",
                column: "MachineType");

            migrationBuilder.CreateIndex(
                name: "IX_ControlFormTemplates_MachineType_Model_SerialNumber",
                table: "ControlFormTemplates",
                columns: new[] { "MachineType", "Model", "SerialNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ControlPlans_ControlFormTemplateId_IsActive",
                table: "ControlPlans",
                columns: new[] { "ControlFormTemplateId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ControlPlans_IsActive",
                table: "ControlPlans",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ControlPlans_NextRunDate",
                table: "ControlPlans",
                column: "NextRunDate");

            migrationBuilder.CreateIndex(
                name: "IX_ControlPlanTargets_ControlPlanId_MachineId",
                table: "ControlPlanTargets",
                columns: new[] { "ControlPlanId", "MachineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ControlPlanTargets_MachineId",
                table: "ControlPlanTargets",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectiveActions_IncidentId",
                table: "CorrectiveActions",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectiveActions_IsgReportId",
                table: "CorrectiveActions",
                column: "IsgReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectiveActions_ObservationId",
                table: "CorrectiveActions",
                column: "ObservationId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectiveActions_Priority",
                table: "CorrectiveActions",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectiveActions_Status",
                table: "CorrectiveActions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DailyIsgReports_ReportDate",
                table: "DailyIsgReports",
                column: "ReportDate");

            migrationBuilder.CreateIndex(
                name: "IX_DailyIsgReports_ReportDate_Shift",
                table: "DailyIsgReports",
                columns: new[] { "ReportDate", "Shift" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyReportProductions_DailyIsgReportId",
                table: "DailyReportProductions",
                column: "DailyIsgReportId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyReportTasks_DailyIsgReportId_TaskType",
                table: "DailyReportTasks",
                columns: new[] { "DailyIsgReportId", "TaskType" });

            migrationBuilder.CreateIndex(
                name: "IX_IsgIncidents_IncidentDateTime",
                table: "IsgIncidents",
                column: "IncidentDateTime");

            migrationBuilder.CreateIndex(
                name: "IX_IsgIncidents_IsgReportId",
                table: "IsgIncidents",
                column: "IsgReportId");

            migrationBuilder.CreateIndex(
                name: "IX_IsgIncidents_Severity",
                table: "IsgIncidents",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_IsgIncidents_Status",
                table: "IsgIncidents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_IsgObservations_IsgReportId",
                table: "IsgObservations",
                column: "IsgReportId");

            migrationBuilder.CreateIndex(
                name: "IX_IsgObservations_RiskLevel",
                table: "IsgObservations",
                column: "RiskLevel");

            migrationBuilder.CreateIndex(
                name: "IX_IsgObservations_Status",
                table: "IsgObservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_IsgReports_ReportDate",
                table: "IsgReports",
                column: "ReportDate");

            migrationBuilder.CreateIndex(
                name: "IX_IsgReports_ReportNumber",
                table: "IsgReports",
                column: "ReportNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MachineChecklistItems_DisplayOrder",
                table: "MachineChecklistItems",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_MachineChecklistItems_MachineTemplateId",
                table: "MachineChecklistItems",
                column: "MachineTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MachineTemplates_MachineType",
                table: "MachineTemplates",
                column: "MachineType");

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_DfiCode",
                table: "NonConformityFollowUps",
                column: "DfiCode");

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_IncidentId",
                table: "NonConformityFollowUps",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_IsgReportId_ObservationId_IncidentId",
                table: "NonConformityFollowUps",
                columns: new[] { "IsgReportId", "ObservationId", "IncidentId" });

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_ObservationId",
                table: "NonConformityFollowUps",
                column: "ObservationId");

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_Status",
                table: "NonConformityFollowUps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_NonConformityFollowUps_TargetDate",
                table: "NonConformityFollowUps",
                column: "TargetDate");

            migrationBuilder.CreateIndex(
                name: "IX_Penalties_PenaltyDate",
                table: "Penalties",
                column: "PenaltyDate");

            migrationBuilder.CreateIndex(
                name: "IX_Penalties_PersonnelId_Status",
                table: "Penalties",
                columns: new[] { "PersonnelId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PreventiveActions_IsgReportId",
                table: "PreventiveActions",
                column: "IsgReportId");

            migrationBuilder.CreateIndex(
                name: "IX_PreventiveActions_Priority",
                table: "PreventiveActions",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_PreventiveActions_Status",
                table: "PreventiveActions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ReminderTasks_DueDate",
                table: "ReminderTasks",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_ReminderTasks_MachineId_ControlFormTemplateId_DueDate",
                table: "ReminderTasks",
                columns: new[] { "MachineId", "ControlFormTemplateId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Toolboxes_CreatedAt",
                table: "Toolboxes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Warnings_PersonnelId_Status",
                table: "Warnings",
                columns: new[] { "PersonnelId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Warnings_WarningDate",
                table: "Warnings",
                column: "WarningDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityPhotos");

            migrationBuilder.DropTable(
                name: "Communications");

            migrationBuilder.DropTable(
                name: "ControlFormAttachments");

            migrationBuilder.DropTable(
                name: "ControlFormExecutionAttachments");

            migrationBuilder.DropTable(
                name: "ControlPlanTargets");

            migrationBuilder.DropTable(
                name: "CorrectiveActions");

            migrationBuilder.DropTable(
                name: "DailyReportProductions");

            migrationBuilder.DropTable(
                name: "DailyReportTasks");

            migrationBuilder.DropTable(
                name: "MachineChecklistItems");

            migrationBuilder.DropTable(
                name: "NonConformityFollowUps");

            migrationBuilder.DropTable(
                name: "Penalties");

            migrationBuilder.DropTable(
                name: "PreventiveActions");

            migrationBuilder.DropTable(
                name: "ReminderTasks");

            migrationBuilder.DropTable(
                name: "Toolboxes");

            migrationBuilder.DropTable(
                name: "Warnings");

            migrationBuilder.DropTable(
                name: "ControlForms");

            migrationBuilder.DropTable(
                name: "ControlFormExecutions");

            migrationBuilder.DropTable(
                name: "ControlPlans");

            migrationBuilder.DropTable(
                name: "DailyIsgReports");

            migrationBuilder.DropTable(
                name: "MachineTemplates");

            migrationBuilder.DropTable(
                name: "IsgIncidents");

            migrationBuilder.DropTable(
                name: "IsgObservations");

            migrationBuilder.DropTable(
                name: "Machines");

            migrationBuilder.DropTable(
                name: "ControlFormTemplates");

            migrationBuilder.DropTable(
                name: "IsgReports");
        }
    }
}
