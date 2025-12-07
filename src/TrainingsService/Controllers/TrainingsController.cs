using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using System.Security.Claims;
using TrainingsService.DTOs;
using TrainingsService.Services;

namespace TrainingsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingsController : ControllerBase
{
    private readonly ITrainingService _trainingService;
    
    public TrainingsController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }
    
    /// <summary>
    /// Eğitim oluştur
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<TrainingResponseDto>>> CreateTraining([FromBody] TrainingCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<TrainingResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _trainingService.CreateTrainingAsync(createDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim bilgisi getir
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<TrainingResponseDto>>> GetTraining(int id)
    {
        var result = await _trainingService.GetTrainingByIdAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Tüm eğitimleri listele
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<TrainingResponseDto>>>> GetAllTrainings()
    {
        var result = await _trainingService.GetAllTrainingsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Aktif eğitimleri listele
    /// </summary>
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<TrainingResponseDto>>>> GetActiveTrainings()
    {
        var result = await _trainingService.GetActiveTrainingsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim güncelle
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TrainingResponseDto>>> UpdateTraining(int id, [FromBody] TrainingCreateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<TrainingResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _trainingService.UpdateTrainingAsync(id, updateDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim sil
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTraining(int id)
    {
        var result = await _trainingService.DeleteTrainingAsync(id);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcıya eğitim ata
    /// </summary>
    [HttpPost("{id}/assign")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<UserTrainingResponseDto>>> AssignTraining(int id, [FromBody] UserTrainingAssignDto assignDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<UserTrainingResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var assignedBy = GetCurrentUserId();
        if (!assignedBy.HasValue)
        {
            return Unauthorized(ApiResponse<UserTrainingResponseDto>.ErrorResponse("Kullanıcı kimliği doğrulanamadı."));
        }
        
        var result = await _trainingService.AssignTrainingToUserAsync(id, assignDto, assignedBy.Value);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim katılımcılarını listele
    /// </summary>
    [HttpGet("{id}/participants")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserTrainingResponseDto>>>> GetTrainingParticipants(int id)
    {
        var result = await _trainingService.GetTrainingParticipantsAsync(id);
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcının eğitimlerini listele
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserTrainingResponseDto>>>> GetUserTrainings(int userId)
    {
        // Kullanıcı sadece kendi eğitimlerini görebilir (Admin/Manager hariç)
        var currentUserId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        
        if (currentUserId != userId && !IsAdminOrManager(userRole))
        {
            return Forbid();
        }
        
        var result = await _trainingService.GetUserTrainingsAsync(userId);
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim durumunu güncelle
    /// </summary>
    [HttpPut("user-training/{userTrainingId}/status")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<UserTrainingResponseDto>>> UpdateTrainingStatus(
        int userTrainingId, 
        [FromQuery] string status, 
        [FromQuery] int? score = null)
    {
        var validStatuses = new[] { "Assigned", "InProgress", "Completed", "Failed", "Cancelled" };
        if (!validStatuses.Contains(status))
        {
            return BadRequest(ApiResponse<UserTrainingResponseDto>.ErrorResponse("Geçersiz durum değeri."));
        }
        
        var result = await _trainingService.UpdateUserTrainingStatusAsync(userTrainingId, status, score);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
    
    private string? GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }
    
    private static bool IsAdminOrManager(string? role)
    {
        return role == "Admin" || role == "Manager";
    }
}
