using Shared.DTOs;
using TrainingsService.DTOs;

namespace TrainingsService.Services;

public interface IUsersServiceClient
{
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int userId);
    Task<ApiResponse<bool>> ValidateUserAsync(int userId);
    Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync();
}
