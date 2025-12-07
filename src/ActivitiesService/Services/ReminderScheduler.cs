using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Services;

public class ReminderScheduler : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<ReminderScheduler> _logger;

    public ReminderScheduler(IServiceProvider sp, ILogger<ReminderScheduler> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderScheduler started");
        // initial delay to let app warm up
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ActivitiesDbContext>();
                await GenerateRemindersAsync(db, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ReminderScheduler error");
            }

            // run every 30 minutes
            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    private static DateTime NormalizeDate(DateTime dt)
    {
        // normalize to local date 08:00 for consistent reminders
        var date = dt.Date.AddHours(8);
        return date;
    }

    private static DateTime? NextDue(DateTime from, string? period, int? periodDays)
    {
        var baseDate = NormalizeDate(from);
        return period switch
        {
            "Daily" => baseDate.AddDays(1),
            "Weekly" => baseDate.AddDays(7),
            "Monthly" => baseDate.AddMonths(1),
            "Yearly" => baseDate.AddYears(1),
            "Custom" => periodDays.HasValue && periodDays.Value > 0 ? baseDate.AddDays(periodDays.Value) : null,
            null or "" => null,
            _ => null
        };
    }

    private async Task GenerateRemindersAsync(ActivitiesDbContext db, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        // load active machines and active templates
        var machines = await db.Machines.AsNoTracking().Where(m => m.Status == "Active").ToListAsync(ct);
        var templates = await db.ControlFormTemplates.AsNoTracking().Where(t => t.IsActive).ToListAsync(ct);

        var newReminders = new List<ReminderTask>();
        foreach (var m in machines)
        {
            var applicable = templates.Where(t => string.Equals(t.MachineType, m.MachineType, StringComparison.OrdinalIgnoreCase));
            foreach (var t in applicable)
            {
                // Determine last reminder due date
                var last = await db.ReminderTasks
                    .Where(r => r.MachineId == m.Id && r.ControlFormTemplateId == t.Id)
                    .OrderByDescending(r => r.DueDate)
                    .FirstOrDefaultAsync(ct);

                DateTime initialDue = NormalizeDate(DateTime.UtcNow);
                if (last != null)
                {
                    var next = NextDue(last.DueDate, t.Period, t.PeriodDays);
                    if (next.HasValue) initialDue = next.Value;
                    else continue; // no period defined, skip
                }
                else
                {
                    var startNext = NextDue(DateTime.UtcNow.AddDays(-1), t.Period, t.PeriodDays);
                    initialDue = startNext ?? NormalizeDate(DateTime.UtcNow);
                }

                // Avoid duplicates within same day for same machine/template
                var exists = await db.ReminderTasks.AnyAsync(r => r.MachineId == m.Id && r.ControlFormTemplateId == t.Id && r.DueDate.Date == initialDue.Date, ct);
                if (exists) continue;

                var title = $"{m.MachineType} · {m.Name} için kontrol formu (Şablon: {t.TemplateName})";
                newReminders.Add(new ReminderTask
                {
                    Title = title,
                    Description = t.DefaultNotes,
                    MachineId = m.Id,
                    ControlFormTemplateId = t.Id,
                    DueDate = initialDue,
                    Period = t.Period,
                    PeriodDays = t.PeriodDays,
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        if (newReminders.Count > 0)
        {
            db.ReminderTasks.AddRange(newReminders);
            await db.SaveChangesAsync(ct);
        }
    }
}
