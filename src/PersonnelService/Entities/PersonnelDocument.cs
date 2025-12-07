namespace PersonnelService.Entities;

public class PersonnelDocument
{
    public int Id { get; set; }
    public int PersonnelId { get; set; } // FK to Personnel
    public string DocumentType { get; set; } = string.Empty; // Sabıka, İkametgah, Diploma, Sağlık, vs.
    public string FileName { get; set; } = string.Empty; // Orijinal dosya adı
    public string StoredPath { get; set; } = string.Empty; // Sunucuda saklanan yol
    public long FileSize { get; set; } // Dosya boyutu (bytes)
    public string ContentType { get; set; } = "application/pdf"; // MIME type
    public DateTime? IssueDate { get; set; } // Belge düzenlenme tarihi
    public DateTime? ExpiryDate { get; set; } // Belge geçerlilik tarihi (varsa)
    public string IssuingAuthority { get; set; } = string.Empty; // Düzenleyen kurum
    public string DocumentNumber { get; set; } = string.Empty; // Belge numarası
    public string Status { get; set; } = "Active"; // Active/Expired/Invalid/Pending
    public string? Notes { get; set; } // Notlar
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Personnel? Personnel { get; set; }
}

// Belge türleri için enum
public static class DocumentTypes
{
    public const string CriminalRecord = "Sabıka Kaydı";
    public const string ResidencePermit = "İkametgah Belgesi";
    public const string Diploma = "Diploma";
    public const string HealthReport = "Sağlık Raporu";
    public const string WorkPermit = "Çalışma İzni";
    public const string IdentityCard = "Kimlik Fotokopisi";
    public const string TaxCertificate = "Vergi Levhası";
    public const string SocialSecurityCard = "SGK Belgesi";
    public const string BloodTest = "Kan Tahlili";
    public const string VaccinationCard = "Aşı Kartı";
    public const string Other = "Diğer";
    public const string Certificate = "Sertifika";
    public const string IsoCertificates = "ISO Sertifikaları";
    public const string InternalTrainingCertificate = "İç Eğitim Sertifikası";
    public const string ExternalTrainingCertificate = "Dış Eğitim Sertifikası";
    public const string DriverLicense = "Ehliyet";
    public const string PersonnelPhoto = "Personel Fotoğrafı";

    public static readonly string[] AllTypes = {
        CriminalRecord,
        ResidencePermit,
        Diploma,
        HealthReport,
        WorkPermit,
        IdentityCard,
        TaxCertificate,
        SocialSecurityCard,
        BloodTest,
        VaccinationCard,
        // Yeni eklenenler
        Certificate,
        IsoCertificates,
        InternalTrainingCertificate,
        ExternalTrainingCertificate,
        DriverLicense,
        PersonnelPhoto,
        Other
    };

    // Zorunlu belgeler
    public static readonly string[] RequiredDocuments = {
        CriminalRecord,
        ResidencePermit,
        Diploma,
        HealthReport,
        IdentityCard,
        DriverLicense,
        PersonnelPhoto
    };
}
