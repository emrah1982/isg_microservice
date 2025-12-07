using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using UsersService.DTOs;
using UsersService.Services;

namespace UsersService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }
    
    /// <summary>
    /// Kullanıcı kaydı
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] UserRegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _userService.RegisterAsync(registerDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı girişi - JWT token üretimi
    /// </summary>
    [HttpPost("authenticate")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Authenticate([FromBody] UserLoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _userService.AuthenticateAsync(loginDto);
        
        if (!result.Success)
        {
            return Unauthorized(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı bilgisi getir
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUser(int id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Tüm kullanıcıları listele
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserResponseDto>>>> GetAllUsers()
    {
        var result = await _userService.GetAllUsersAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı güncelle
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> UpdateUser(int id, [FromBody] UserRegisterDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<UserResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _userService.UpdateUserAsync(id, updateDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı sil
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı doğrulama (diğer servisler için)
    /// </summary>
    [HttpGet("validate/{userId}")]
    public async Task<ActionResult<ApiResponse<bool>>> ValidateUser(int userId)
    {
        var result = await _userService.ValidateUserAsync(userId);
        return Ok(result);
    }
}
