namespace ActivitiesService.Entities;

public class CommunicationLetter
{
    public int Id { get; set; }
    public string? LetterNumber { get; set; } = string.Empty; // Yazı numarası
    public int? PersonnelId { get; set; } // İlgili personel (opsiyonel)
    public int? CompanyId { get; set; }
    public string? CompanyName { get; set; } = string.Empty;
    public string? SenderName { get; set; } = string.Empty; // Gönderen
    public string? ReceiverName { get; set; } = string.Empty; // Alıcı
    public DateTime SentDate { get; set; } = DateTime.UtcNow; // Gönderim tarihi
    public string? Medium { get; set; } = string.Empty; // Email/Telefon/Yazı vb.
    public string? Subject { get; set; } = string.Empty; // Konu
    public string? Content { get; set; } = string.Empty; // İçerik/metin
    public string? Status { get; set; } = "Open"; // Open/Closed/Archived
    public string? AttachmentPath { get; set; } = string.Empty; // Ek dosya yolu
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
