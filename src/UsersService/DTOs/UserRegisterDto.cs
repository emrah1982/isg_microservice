using System.ComponentModel.DataAnnotations;

namespace UsersService.DTOs;

public class UserRegisterDto
{
    [Required(ErrorMessage = "Ad alanı zorunludur")]
    [MaxLength(50, ErrorMessage = "Ad en fazla 50 karakter olabilir")]
    public string FirstName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Soyad alanı zorunludur")]
    [MaxLength(50, ErrorMessage = "Soyad en fazla 50 karakter olabilir")]
    public string LastName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "E-posta alanı zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
    [MaxLength(100, ErrorMessage = "E-posta en fazla 100 karakter olabilir")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Şifre alanı zorunludur")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    public string Password { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Rol seçimi zorunludur")]
    public int RoleId { get; set; }
    
    [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz")]
    public string? PhoneNumber { get; set; }
    
    [StringLength(11, MinimumLength = 11, ErrorMessage = "TC Kimlik No 11 haneli olmalıdır")]
    public string? TcNo { get; set; }
    
    [MaxLength(100, ErrorMessage = "Departman en fazla 100 karakter olabilir")]
    public string? Department { get; set; }
    
    [MaxLength(100, ErrorMessage = "Pozisyon en fazla 100 karakter olabilir")]
    public string? Position { get; set; }
    
    public DateTime? HireDate { get; set; }
}
