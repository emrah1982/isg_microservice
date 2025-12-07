namespace UsersService.DTOs;

public class UserResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? TcNo { get; set; }
    public string? Department { get; set; }
    public string? Position { get; set; }
    public DateTime? HireDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
