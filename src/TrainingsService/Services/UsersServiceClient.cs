using Shared.DTOs;
using System.Text.Json;
using TrainingsService.DTOs;

namespace TrainingsService.Services;

public class UsersServiceClient : IUsersServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<UsersServiceClient> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    
    public UsersServiceClient(HttpClient httpClient, ILogger<UsersServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }
    
    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int userId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/users/{userId}");
            var content = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content, _jsonOptions);
                if (apiResponse?.Success == true && apiResponse.Data != null)
                {
                    var userJson = JsonSerializer.Serialize(apiResponse.Data);
                    var userDto = JsonSerializer.Deserialize<UserDto>(userJson, _jsonOptions);
                    
                    return ApiResponse<UserDto>.SuccessResponse(userDto!, "Kullanıcı bilgisi alındı.");
                }
            }
            
            _logger.LogWarning($"UsersService'den kullanıcı bilgisi alınamadı. UserId: {userId}, StatusCode: {response.StatusCode}");
            return ApiResponse<UserDto>.ErrorResponse("Kullanıcı bilgisi alınamadı.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"UsersService ile iletişim hatası. UserId: {userId}");
            return ApiResponse<UserDto>.ErrorResponse($"Servis iletişim hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> ValidateUserAsync(int userId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/users/validate/{userId}");
            var content = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<bool>>(content, _jsonOptions);
                if (apiResponse?.Success == true)
                {
                    return ApiResponse<bool>.SuccessResponse(apiResponse.Data, "Kullanıcı doğrulandı.");
                }
            }
            
            _logger.LogWarning($"Kullanıcı doğrulanamadı. UserId: {userId}, StatusCode: {response.StatusCode}");
            return ApiResponse<bool>.ErrorResponse("Kullanıcı doğrulanamadı.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Kullanıcı doğrulama hatası. UserId: {userId}");
            return ApiResponse<bool>.ErrorResponse($"Doğrulama hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/users");
            var content = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content, _jsonOptions);
                if (apiResponse?.Success == true && apiResponse.Data != null)
                {
                    var usersJson = JsonSerializer.Serialize(apiResponse.Data);
                    var users = JsonSerializer.Deserialize<IEnumerable<UserDto>>(usersJson, _jsonOptions);
                    
                    return ApiResponse<IEnumerable<UserDto>>.SuccessResponse(users!, "Kullanıcı listesi alındı.");
                }
            }
            
            _logger.LogWarning($"UsersService'den kullanıcı listesi alınamadı. StatusCode: {response.StatusCode}");
            return ApiResponse<IEnumerable<UserDto>>.ErrorResponse("Kullanıcı listesi alınamadı.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kullanıcı listesi alma hatası");
            return ApiResponse<IEnumerable<UserDto>>.ErrorResponse($"Servis iletişim hatası: {ex.Message}");
        }
    }
}
