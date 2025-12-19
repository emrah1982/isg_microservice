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
    public const string CriminalRecord = "Adli sicil kaydı";
    public const string ResidencePermit = "İkametgah belgesi";
    public const string Diploma = "Diploma fotokopisi";
    public const string HealthReport = "Sağlık raporu";
    public const string WorkPermit = "Çalışma İzni";
    public const string IdentityCard = "Nüfus cüzdanı fotokopisi";
    public const string TaxCertificate = "Vergi Levhası";
    public const string SocialSecurityCard = "SGK işe giriş bildirgesi";
    public const string BloodTest = "Kan Tahlili";
    public const string VaccinationCard = "Aşı Kartı";
    public const string Other = "Diğer";
    public const string Certificate = "Sertifika";
    public const string IsoCertificates = "ISO Sertifikaları";
    public const string InternalTrainingCertificate = "İç Eğitim Sertifikası";
    public const string ExternalTrainingCertificate = "Dış Eğitim Sertifikası";
    public const string DriverLicense = "Ehliyet";
    public const string PersonnelPhoto = "Vesikalık fotoğraf";
    public const string EmploymentContract = "İş sözleşmesi";
    public const string MilitaryStatus = "Askerlik durum belgesi";
    public const string JobApplicationForm = "İş başvuru formu";
    public const string MarriageCertificate = "Evlilik cüzdanı fotokopisi";
    public const string SpouseIdCard = "Eşinin nüfus cüzdanı fotokopisi";
    public const string ChildrenIdCard = "Çocukların nüfus cüzdanı fotokopisi";
    public const string SgkExitDocument = "SGK çıkış belgesi";
    public const string LastSalarySlip = "Son maaş bordrosu";

    public static readonly string[] AllTypes = {
        IdentityCard,
        SocialSecurityCard,
        EmploymentContract,
        PersonnelPhoto,
        MilitaryStatus,
        CriminalRecord,
        JobApplicationForm,
        ResidencePermit,
        HealthReport,
        Diploma,
        MarriageCertificate,
        SpouseIdCard,
        ChildrenIdCard,
        SgkExitDocument,
        LastSalarySlip,
        WorkPermit,
        TaxCertificate,
        BloodTest,
        VaccinationCard,
        Certificate,
        IsoCertificates,
        InternalTrainingCertificate,
        ExternalTrainingCertificate,
        DriverLicense,
        Other
    };

    // Zorunlu belgeler
    public static readonly string[] RequiredDocuments = {
        IdentityCard,
        SocialSecurityCard,
        EmploymentContract,
        PersonnelPhoto,
        CriminalRecord,
        JobApplicationForm,
        ResidencePermit,
        HealthReport,
        Diploma
    };
}
