namespace DocumentsService.DTOs;

public class DocumentAccessResponseDto
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    public string AccessType { get; set; } = string.Empty;
    public DateTime? AccessGrantedDate { get; set; }
    public DateTime? AccessExpiryDate { get; set; }
}
