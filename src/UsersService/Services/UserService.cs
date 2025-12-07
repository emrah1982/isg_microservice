using Shared.DTOs;
using Shared.Utils;
using UsersService.DTOs;
using UsersService.Entities;
using UsersService.Repositories;

namespace UsersService.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IConfiguration _configuration;
    
    public UserService(IUserRepository userRepository, IRoleRepository roleRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _configuration = configuration;
    }
    
    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegisterDto registerDto)
    {
        try
        {
            // Email kontrolü
            if (await _userRepository.EmailExistsAsync(registerDto.Email))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Bu e-posta adresi zaten kullanılmaktadır.");
            }
            
            // TC No kontrolü
            if (!string.IsNullOrEmpty(registerDto.TcNo) && await _userRepository.TcNoExistsAsync(registerDto.TcNo))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Bu TC Kimlik No zaten kullanılmaktadır.");
            }
            
            // Rol kontrolü
            var role = await _roleRepository.GetByIdAsync(registerDto.RoleId);
            if (role == null)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Geçersiz rol seçimi.");
            }
            
            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = PasswordHelper.HashPassword(registerDto.Password),
                RoleId = registerDto.RoleId,
                PhoneNumber = registerDto.PhoneNumber,
                TcNo = registerDto.TcNo,
                Department = registerDto.Department,
                Position = registerDto.Position,
                HireDate = registerDto.HireDate
            };
            
            var createdUser = await _userRepository.CreateAsync(user);
            createdUser.Role = role;
            
            var token = GenerateJwtToken(createdUser);
            
            var response = new AuthResponseDto
            {
                Token = token,
                User = MapToUserResponseDto(createdUser),
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
            
            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Kullanıcı başarıyla kaydedildi.");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.ErrorResponse($"Kayıt işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<AuthResponseDto>> AuthenticateAsync(UserLoginDto loginDto)
    {
        try
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            
            if (user == null)
            {
                Console.WriteLine($"DEBUG: User not found for email: {loginDto.Email}");
                return ApiResponse<AuthResponseDto>.ErrorResponse("E-posta veya şifre hatalı.");
            }
            
            Console.WriteLine($"DEBUG: User found - Email: {user.Email}, Hash: {user.PasswordHash?.Substring(0, 20)}...");
            Console.WriteLine($"DEBUG: Password to verify: {loginDto.Password}");
            
            var passwordValid = PasswordHelper.VerifyPassword(loginDto.Password, user.PasswordHash);
            Console.WriteLine($"DEBUG: Password verification result: {passwordValid}");
            
            if (!passwordValid)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("E-posta veya şifre hatalı.");
            }
            
            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.");
            }
            
            // Son giriş tarihini güncelle
            user.LastLoginDate = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            
            var token = GenerateJwtToken(user);
            
            var response = new AuthResponseDto
            {
                Token = token,
                User = MapToUserResponseDto(user),
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
            
            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Giriş başarılı.");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.ErrorResponse($"Giriş işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(int id)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse("Kullanıcı bulunamadı.");
            }
            
            return ApiResponse<UserResponseDto>.SuccessResponse(MapToUserResponseDto(user));
        }
        catch (Exception ex)
        {
            return ApiResponse<UserResponseDto>.ErrorResponse($"Kullanıcı getirme işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<UserResponseDto>>> GetAllUsersAsync()
    {
        try
        {
            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(MapToUserResponseDto);
            
            return ApiResponse<IEnumerable<UserResponseDto>>.SuccessResponse(userDtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<IEnumerable<UserResponseDto>>.ErrorResponse($"Kullanıcıları getirme işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<UserResponseDto>> UpdateUserAsync(int id, UserRegisterDto updateDto)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse("Kullanıcı bulunamadı.");
            }
            
            // Email değişikliği kontrolü
            if (user.Email != updateDto.Email && await _userRepository.EmailExistsAsync(updateDto.Email))
            {
                return ApiResponse<UserResponseDto>.ErrorResponse("Bu e-posta adresi zaten kullanılmaktadır.");
            }
            
            // TC No değişikliği kontrolü
            if (!string.IsNullOrEmpty(updateDto.TcNo) && user.TcNo != updateDto.TcNo && await _userRepository.TcNoExistsAsync(updateDto.TcNo))
            {
                return ApiResponse<UserResponseDto>.ErrorResponse("Bu TC Kimlik No zaten kullanılmaktadır.");
            }
            
            // Rol kontrolü
            var role = await _roleRepository.GetByIdAsync(updateDto.RoleId);
            if (role == null)
            {
                return ApiResponse<UserResponseDto>.ErrorResponse("Geçersiz rol seçimi.");
            }
            
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;
            user.RoleId = updateDto.RoleId;
            user.PhoneNumber = updateDto.PhoneNumber;
            user.TcNo = updateDto.TcNo;
            user.Department = updateDto.Department;
            user.Position = updateDto.Position;
            user.HireDate = updateDto.HireDate;
            
            // Şifre güncellenmişse hash'le
            if (!string.IsNullOrEmpty(updateDto.Password))
            {
                user.PasswordHash = PasswordHelper.HashPassword(updateDto.Password);
            }
            
            var updatedUser = await _userRepository.UpdateAsync(user);
            updatedUser.Role = role;
            
            return ApiResponse<UserResponseDto>.SuccessResponse(MapToUserResponseDto(updatedUser), "Kullanıcı başarıyla güncellendi.");
        }
        catch (Exception ex)
        {
            return ApiResponse<UserResponseDto>.ErrorResponse($"Güncelleme işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteUserAsync(int id)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("Kullanıcı bulunamadı.");
            }
            
            await _userRepository.DeleteAsync(id);
            
            return ApiResponse<bool>.SuccessResponse(true, "Kullanıcı başarıyla silindi.");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse($"Silme işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> ValidateUserAsync(int userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null || !user.IsActive)
            {
                return ApiResponse<bool>.ErrorResponse("Kullanıcı bulunamadı veya pasif durumda.");
            }
            
            return ApiResponse<bool>.SuccessResponse(true, "Kullanıcı geçerli.");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse($"Doğrulama işlemi sırasında hata oluştu: {ex.Message}");
        }
    }
    
    private string GenerateJwtToken(User user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "ISG-System-Secret-Key-2024-Very-Long-Secret";
        return JwtHelper.GenerateToken(user.Id.ToString(), user.Email, user.Role.Name, secretKey, 1440); // 24 saat
    }
    
    private static UserResponseDto MapToUserResponseDto(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            RoleName = user.Role.Name,
            PhoneNumber = user.PhoneNumber,
            TcNo = user.TcNo,
            Department = user.Department,
            Position = user.Position,
            HireDate = user.HireDate,
            IsActive = user.IsActive,
            LastLoginDate = user.LastLoginDate,
            CreatedAt = user.CreatedAt
        };
    }
}
