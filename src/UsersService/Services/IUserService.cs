using Shared.DTOs;
using UsersService.DTOs;

namespace UsersService.Services;

public interface IUserService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegisterDto registerDto);
    Task<ApiResponse<AuthResponseDto>> AuthenticateAsync(UserLoginDto loginDto);
    Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<IEnumerable<UserResponseDto>>> GetAllUsersAsync();
    Task<ApiResponse<UserResponseDto>> UpdateUserAsync(int id, UserRegisterDto updateDto);
    Task<ApiResponse<bool>> DeleteUserAsync(int id);
    Task<ApiResponse<bool>> ValidateUserAsync(int userId);
}
