namespace DocumentsService.DTOs;

public class DocumentResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
    public string Version { get; set; } = string.Empty;
    public int? UploadedBy { get; set; }
    public string? UploadedByName { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool RequiresApproval { get; set; }
    public int? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<DocumentAccessResponseDto> AccessPermissions { get; set; } = new();
}
