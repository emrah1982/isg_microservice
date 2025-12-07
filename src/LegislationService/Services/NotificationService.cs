namespace LegislationService.Services
{
    public class NotificationService
    {
        private readonly ILogger<NotificationService> _logger;
        public NotificationService(ILogger<NotificationService> logger)
        {
            _logger = logger;
        }

        // Basit stub: ileride e-posta/SMS entegrasyonu ile değiştirilebilir
        public Task SendNewRegulationAlertAsync(string title, string? link)
        {
            _logger.LogInformation("[NOTIFY] New regulation detected: {Title} ({Link})", title, link);
            return Task.CompletedTask;
        }
    }
}
