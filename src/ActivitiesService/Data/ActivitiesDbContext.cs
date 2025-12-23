using Microsoft.EntityFrameworkCore;
using ActivitiesService.Entities;

namespace ActivitiesService.Data;

public class ActivitiesDbContext : DbContext
{
    public ActivitiesDbContext(DbContextOptions<ActivitiesDbContext> options) : base(options) {}

    public DbSet<IsgReport> IsgReports => Set<IsgReport>();
    public DbSet<IsgObservation> IsgObservations => Set<IsgObservation>();
    public DbSet<IsgIncident> IsgIncidents => Set<IsgIncident>();
    public DbSet<CorrectiveAction> CorrectiveActions => Set<CorrectiveAction>();
    public DbSet<PreventiveAction> PreventiveActions => Set<PreventiveAction>();
    public DbSet<Warning> Warnings => Set<Warning>();
    public DbSet<Penalty> Penalties => Set<Penalty>();
    public DbSet<ActivityPhoto> ActivityPhotos => Set<ActivityPhoto>();
    public DbSet<NonConformityFollowUp> NonConformityFollowUps => Set<NonConformityFollowUp>();
    public DbSet<CommunicationLetter> Communications => Set<CommunicationLetter>();
    public DbSet<DailyIsgReport> DailyIsgReports => Set<DailyIsgReport>();
    public DbSet<DailyReportTask> DailyReportTasks => Set<DailyReportTask>();
    public DbSet<DailyReportProduction> DailyReportProductions => Set<DailyReportProduction>();
    public DbSet<Toolbox> Toolboxes => Set<Toolbox>();
    public DbSet<ControlForm> ControlForms => Set<ControlForm>();
    public DbSet<ControlFormAttachment> ControlFormAttachments => Set<ControlFormAttachment>();
    public DbSet<MachineTemplate> MachineTemplates => Set<MachineTemplate>();
    public DbSet<MachineChecklistItem> MachineChecklistItems => Set<MachineChecklistItem>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<ControlFormTemplate> ControlFormTemplates => Set<ControlFormTemplate>();
    public DbSet<ControlFormExecution> ControlFormExecutions => Set<ControlFormExecution>();
    public DbSet<ControlFormExecutionAttachment> ControlFormExecutionAttachments => Set<ControlFormExecutionAttachment>();
    public DbSet<ReminderTask> ReminderTasks => Set<ReminderTask>();
    public DbSet<ControlPlan> ControlPlans => Set<ControlPlan>();
    public DbSet<ControlPlanTarget> ControlPlanTargets => Set<ControlPlanTarget>();
    public DbSet<FieldInspection> FieldInspections => Set<FieldInspection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // IsgReport configuration
        modelBuilder.Entity<IsgReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReportNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.SiteName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.PreparedBy).HasMaxLength(100);
            entity.Property(e => e.WeatherCondition).HasMaxLength(100);
            entity.Property(e => e.WorkingConditions).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.HasIndex(e => e.ReportNumber).IsUnique();
            entity.HasIndex(e => e.ReportDate);
        });

        // IsgObservation configuration
        modelBuilder.Entity<IsgObservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ObservationType).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.RiskLevel).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.ResponsiblePersonName).HasMaxLength(100);
            entity.Property(e => e.CompletionNotes).HasMaxLength(1000);
            entity.HasOne(e => e.IsgReport).WithMany(r => r.Observations).HasForeignKey(e => e.IsgReportId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.RiskLevel);
        });

        // IsgIncident configuration
        modelBuilder.Entity<IsgIncident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IncidentType).HasMaxLength(50);
            entity.Property(e => e.Severity).HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.AffectedPersonName).HasMaxLength(100);
            entity.Property(e => e.InjuryType).HasMaxLength(100);
            entity.Property(e => e.ImmediateActions).HasMaxLength(1000);
            entity.Property(e => e.RootCause).HasMaxLength(1000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.InvestigatorName).HasMaxLength(100);
            entity.Property(e => e.FinalReport).HasMaxLength(2000);
            entity.HasOne(e => e.IsgReport).WithMany(r => r.Incidents).HasForeignKey(e => e.IsgReportId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Severity);
            entity.HasIndex(e => e.IncidentDateTime);
        });

        // CorrectiveAction configuration
        modelBuilder.Entity<CorrectiveAction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActionType).HasMaxLength(20).HasDefaultValue("Corrective");
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Planned");
            entity.Property(e => e.AssignedToPersonName).HasMaxLength(100);
            entity.Property(e => e.CreatedByPersonName).HasMaxLength(100);
            entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ActualCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Resources).HasMaxLength(1000);
            entity.Property(e => e.CompletionNotes).HasMaxLength(1000);
            entity.Property(e => e.EffectivenessEvaluation).HasMaxLength(1000);
            entity.HasOne(e => e.IsgReport).WithMany(r => r.CorrectiveActions).HasForeignKey(e => e.IsgReportId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Observation).WithMany().HasForeignKey(e => e.ObservationId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Incident).WithMany().HasForeignKey(e => e.IncidentId).OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
        });

        // PreventiveAction configuration
        modelBuilder.Entity<PreventiveAction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActionType).HasMaxLength(20).HasDefaultValue("Preventive");
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Objective).HasMaxLength(500);
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Planned");
            entity.Property(e => e.AssignedToPersonName).HasMaxLength(100);
            entity.Property(e => e.CreatedByPersonName).HasMaxLength(100);
            entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ActualCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Resources).HasMaxLength(1000);
            entity.Property(e => e.SuccessMetrics).HasMaxLength(500);
            entity.Property(e => e.CompletionNotes).HasMaxLength(1000);
            entity.Property(e => e.EffectivenessEvaluation).HasMaxLength(1000);
            entity.Property(e => e.RecurrencePattern).HasMaxLength(50);
            entity.HasOne(e => e.IsgReport).WithMany(r => r.PreventiveActions).HasForeignKey(e => e.IsgReportId).OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
        });

        // Warning configuration
        modelBuilder.Entity<Warning>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WarningNumber).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.PersonnelName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.PersonnelTcNo).HasMaxLength(11).IsRequired(false);
            entity.Property(e => e.PersonnelPosition).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.CompanyName).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.IssuedByPersonName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.WarningType).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.Category).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.ViolationType).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.Description).HasMaxLength(2000).IsRequired(false);
            entity.Property(e => e.Location).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.Witnesses).HasMaxLength(500).IsRequired(false);
            entity.Property(e => e.ImmediateActions).HasMaxLength(1000).IsRequired(false);
            entity.Property(e => e.ExpectedImprovement).HasMaxLength(500).IsRequired(false);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active").IsRequired(false);
            entity.Property(e => e.PersonnelResponse).HasMaxLength(2000).IsRequired(false);
            entity.Property(e => e.AttachmentPath).HasMaxLength(500).IsRequired(false);
            entity.HasIndex(e => e.WarningDate);
            entity.HasIndex(e => new { e.PersonnelId, e.Status });
        });

        // CommunicationLetter configuration
        modelBuilder.Entity<CommunicationLetter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LetterNumber).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.CompanyName).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.SenderName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.ReceiverName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.Subject).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.Content).HasMaxLength(4000).IsRequired(false);
            entity.Property(e => e.Medium).HasMaxLength(50).IsRequired(false); // Email/Telefon/Yazı
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open").IsRequired(false);
            entity.Property(e => e.AttachmentPath).HasMaxLength(500).IsRequired(false);
            entity.HasIndex(e => e.SentDate);
            entity.HasIndex(e => new { e.PersonnelId, e.Status });
        });

        // Penalty configuration
        modelBuilder.Entity<Penalty>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PenaltyNumber).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.PersonnelName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.PersonnelTcNo).HasMaxLength(11).IsRequired(false);
            entity.Property(e => e.PersonnelPosition).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.CompanyName).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.IssuedByPersonName).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.PenaltyType).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.Category).HasMaxLength(50).IsRequired(false);
            entity.Property(e => e.ViolationType).HasMaxLength(100).IsRequired(false);
            entity.Property(e => e.Description).HasMaxLength(2000).IsRequired(false);
            entity.Property(e => e.Location).HasMaxLength(200).IsRequired(false);
            entity.Property(e => e.Severity).HasMaxLength(20).IsRequired(false);
            entity.Property(e => e.LegalBasis).HasMaxLength(500).IsRequired(false);
            entity.Property(e => e.Witnesses).HasMaxLength(500).IsRequired(false);
            entity.Property(e => e.Evidence).HasMaxLength(1000).IsRequired(false);
            entity.Property(e => e.DefenseStatement).HasMaxLength(2000).IsRequired(false);
            entity.Property(e => e.DecisionReason).HasMaxLength(1000).IsRequired(false);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active").IsRequired(false);
            entity.Property(e => e.AppealReason).HasMaxLength(1000).IsRequired(false);
            entity.Property(e => e.AppealDecision).HasMaxLength(1000).IsRequired(false);
            entity.Property(e => e.AttachmentPath).HasMaxLength(500).IsRequired(false);
            entity.Property(e => e.FinancialPenalty).HasColumnType("decimal(18,2)");
            entity.HasIndex(e => e.PenaltyDate);
            entity.HasIndex(e => new { e.PersonnelId, e.Status });
        });

        // ActivityPhoto configuration
        modelBuilder.Entity<ActivityPhoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.StoredPath).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });

        // NonConformityFollowUp (DÖF) configuration
        modelBuilder.Entity<NonConformityFollowUp>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.NonConformityDescription).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.RootCauseCategory).HasMaxLength(20); // Insan/Malzeme/Makine/Metot/Doğa
            entity.Property(e => e.RootCauseDetails).HasMaxLength(2000);
            entity.Property(e => e.RootCauseCategoriesCsv).HasMaxLength(200);
            entity.Property(e => e.PlannedCorrectiveActions).HasMaxLength(3000);
            entity.Property(e => e.PreventiveImprovements).HasMaxLength(3000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.AssignedToPersonName).HasMaxLength(100);
            entity.Property(e => e.TrackingExplanation).HasMaxLength(1000);

            // New optional fields
            entity.Property(e => e.DfiCode).HasMaxLength(50);
            entity.Property(e => e.AttachmentPath).HasMaxLength(500);

            entity.HasOne(e => e.IsgReport)
                .WithMany(r => r.NonConformityFollowUps) // no dedicated collection on report; keep as neutral, not enforcing inverse
                .HasForeignKey(e => e.IsgReportId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Observation)
                .WithMany()
                .HasForeignKey(e => e.ObservationId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Incident)
                .WithMany()
                .HasForeignKey(e => e.IncidentId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.TargetDate);
            entity.HasIndex(e => new { e.IsgReportId, e.ObservationId, e.IncidentId });
            entity.HasIndex(e => e.DfiCode);
        });

        // DailyIsgReport configuration
        modelBuilder.Entity<DailyIsgReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Shift).HasMaxLength(20).IsRequired();
            entity.Property(e => e.WeatherCondition).HasMaxLength(200);
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.Highlights).HasMaxLength(2000);
            entity.HasIndex(e => e.ReportDate);
            entity.HasIndex(e => new { e.ReportDate, e.Shift });
        });

        // DailyReportTask configuration
        modelBuilder.Entity<DailyReportTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TaskType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.StartTime).HasMaxLength(10);
            entity.Property(e => e.EndTime).HasMaxLength(10);
            entity.Property(e => e.Responsible).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Priority).HasMaxLength(20);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.HasOne(e => e.DailyIsgReport)
                .WithMany(r => r.Tasks)
                .HasForeignKey(e => e.DailyIsgReportId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.DailyIsgReportId, e.TaskType });
        });

        // DailyReportProduction configuration
        modelBuilder.Entity<DailyReportProduction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.SafetyMeasures).HasMaxLength(2000);
            entity.Property(e => e.RiskLevel).HasMaxLength(20);
            entity.Property(e => e.EquipmentUsed).HasMaxLength(500);
            entity.HasOne(e => e.DailyIsgReport)
                .WithMany(r => r.Productions)
                .HasForeignKey(e => e.DailyIsgReportId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.DailyIsgReportId);
        });

        // Toolbox configuration
        modelBuilder.Entity<Toolbox>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Keywords).HasMaxLength(500);
            entity.Property(e => e.CreatedByPersonName).HasMaxLength(100);
            entity.HasIndex(e => e.CreatedAt);
        });

        // ControlForm configuration
        modelBuilder.Entity<ControlForm>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FormNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.MachineName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.MachineModel).HasMaxLength(100);
            entity.Property(e => e.MachineSerialNumber).HasMaxLength(100);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.ControlledByPersonName).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.ChecklistItemsJson).HasColumnType("TEXT");
            entity.HasIndex(e => e.FormNumber).IsUnique();
            entity.HasIndex(e => e.ControlDate);
            entity.HasIndex(e => e.Status);
        });

        // ControlFormAttachment configuration
        modelBuilder.Entity<ControlFormAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.StoredPath).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.FileType).HasMaxLength(20).HasDefaultValue("Document");
            entity.HasOne(e => e.ControlForm)
                .WithMany(c => c.Attachments)
                .HasForeignKey(e => e.ControlFormId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.ControlFormId);
        });

        // MachineTemplate configuration
        modelBuilder.Entity<MachineTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MachineType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.HasIndex(e => e.MachineType);
        });

        // MachineChecklistItem configuration
        modelBuilder.Entity<MachineChecklistItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemText).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.IsRequired).HasDefaultValue(true);
            entity.HasOne(e => e.MachineTemplate)
                .WithMany(m => m.ChecklistItems)
                .HasForeignKey(e => e.MachineTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.MachineTemplateId);
            entity.HasIndex(e => e.DisplayOrder);
        });

        // ControlFormTemplate configuration
        modelBuilder.Entity<ControlFormTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TemplateName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.MachineType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.SerialNumber).HasMaxLength(100);
            entity.Property(e => e.DefaultStatus).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.DefaultNotes).HasMaxLength(2000);
            entity.Property(e => e.Period).HasMaxLength(20); // Daily/Weekly/Monthly/Yearly/Custom
            entity.Property(e => e.PeriodDays);
            entity.Property(e => e.ChecklistItemsJson).HasColumnType("TEXT");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.HasIndex(e => e.MachineType);
            entity.HasIndex(e => new { e.MachineType, e.Model, e.SerialNumber });
        });

        // ControlFormExecution configuration
        modelBuilder.Entity<ControlFormExecution>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExecutionNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.MachineName).HasMaxLength(200);
            entity.Property(e => e.MachineModel).HasMaxLength(100);
            entity.Property(e => e.MachineSerialNumber).HasMaxLength(100);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.ExecutedByPersonName).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("InProgress");
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.ChecklistResponsesJson).HasColumnType("TEXT");
            entity.Property(e => e.TotalScore).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MaxScore).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SuccessPercentage).HasColumnType("decimal(5,2)");
            entity.HasOne(e => e.ControlFormTemplate)
                .WithMany()
                .HasForeignKey(e => e.ControlFormTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Machine)
                .WithMany()
                .HasForeignKey(e => e.MachineId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.ExecutionNumber).IsUnique();
            entity.HasIndex(e => e.ExecutionDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.ControlFormTemplateId, e.ExecutionDate });
        });

        // ControlFormExecutionAttachment configuration
        modelBuilder.Entity<ControlFormExecutionAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.StoredPath).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.FileType).HasMaxLength(20).HasDefaultValue("Document");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(e => e.ControlFormExecution)
                .WithMany(c => c.Attachments)
                .HasForeignKey(e => e.ControlFormExecutionId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.ControlFormExecutionId);
        });

        // ReminderTask configuration
        modelBuilder.Entity<ReminderTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.Period).HasMaxLength(20);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => new { e.MachineId, e.ControlFormTemplateId, e.DueDate });
        });

        // ControlPlan configuration
        modelBuilder.Entity<ControlPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Period).HasMaxLength(20).IsRequired(); // Daily/Weekly/Monthly/Yearly
            entity.Property(e => e.Interval).HasColumnName("IntervalValue").HasDefaultValue(1);
            entity.Property(e => e.WeekDaysJson).HasColumnType("TEXT");
            entity.Property(e => e.StartRule).HasMaxLength(50).HasDefaultValue("OnFirstApproval");
            entity.HasOne(e => e.ControlFormTemplate)
                .WithMany()
                .HasForeignKey(e => e.ControlFormTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.NextRunDate);
            entity.HasIndex(e => new { e.ControlFormTemplateId, e.IsActive });
        });

        // ControlPlanTarget configuration
        modelBuilder.Entity<ControlPlanTarget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ControlPlan)
                .WithMany(p => p.Targets)
                .HasForeignKey(e => e.ControlPlanId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Machine)
                .WithMany()
                .HasForeignKey(e => e.MachineId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.ControlPlanId, e.MachineId }).IsUnique();
        });

        // FieldInspection configuration
        modelBuilder.Entity<FieldInspection>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Location).HasMaxLength(500).IsRequired();
            entity.Property(e => e.HazardTitle).HasMaxLength(500).IsRequired();
            entity.Property(e => e.HazardDescription).IsRequired();
            entity.Property(e => e.Legislation).HasMaxLength(500);
            entity.Property(e => e.Measures).IsRequired();
            entity.Property(e => e.RiskTargets).HasMaxLength(100);
            entity.Property(e => e.RiskLevel).HasMaxLength(50);
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.RiskLevel);
            entity.HasIndex(e => new { e.CompanyId, e.Date });
        });
    }
}
