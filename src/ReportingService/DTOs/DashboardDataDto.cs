namespace ReportingService.DTOs;

public class DashboardDataDto
{
    public UserStatistics UserStats { get; set; } = new();
    public TrainingStatistics TrainingStats { get; set; } = new();
    public RiskStatistics RiskStats { get; set; } = new();
    public IncidentStatistics IncidentStats { get; set; } = new();
    public DocumentStatistics DocumentStats { get; set; } = new();
}

public class UserStatistics
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public Dictionary<string, int> UsersByRole { get; set; } = new();
}

public class TrainingStatistics
{
    public int TotalTrainings { get; set; }
    public int CompletedTrainings { get; set; }
    public int PendingTrainings { get; set; }
    public int OverdueTrainings { get; set; }
    public double CompletionRate { get; set; }
}

public class RiskStatistics
{
    public int TotalRisks { get; set; }
    public int OpenRisks { get; set; }
    public int HighSeverityRisks { get; set; }
    public Dictionary<string, int> RisksByCategory { get; set; } = new();
    public Dictionary<string, int> RisksByStatus { get; set; } = new();
}

public class IncidentStatistics
{
    public int TotalIncidents { get; set; }
    public int OpenIncidents { get; set; }
    public int IncidentsThisMonth { get; set; }
    public Dictionary<string, int> IncidentsByType { get; set; } = new();
    public Dictionary<string, int> IncidentsBySeverity { get; set; } = new();
}

public class DocumentStatistics
{
    public int TotalDocuments { get; set; }
    public int PendingApproval { get; set; }
    public int ExpiringDocuments { get; set; }
    public Dictionary<string, int> DocumentsByCategory { get; set; } = new();
}
