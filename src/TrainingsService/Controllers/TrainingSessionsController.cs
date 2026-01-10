using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using System.Security.Claims;
using TrainingsService.DTOs;
using TrainingsService.Services;

namespace TrainingsService.Controllers;

[ApiController]
[Route("api/training-sessions")]
[Authorize]
public class TrainingSessionsController : ControllerBase
{
    private readonly ITrainingSessionService _sessionService;
    
    public TrainingSessionsController(ITrainingSessionService sessionService)
    {
        _sessionService = sessionService;
    }
    
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SessionResponseDto>>> CreateSession([FromBody] SessionCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<SessionResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _sessionService.CreateSessionAsync(createDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SessionResponseDto>>> GetSession(int id)
    {
        var result = await _sessionService.GetSessionByIdAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<SessionResponseDto>>>> GetAllSessions()
    {
        var result = await _sessionService.GetAllSessionsAsync();
        return Ok(result);
    }
    
    [HttpGet("training/{trainingId}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<SessionResponseDto>>>> GetSessionsByTraining(int trainingId)
    {
        var result = await _sessionService.GetSessionsByTrainingIdAsync(trainingId);
        return Ok(result);
    }
    
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<SessionResponseDto>>>> GetActiveSessions()
    {
        var result = await _sessionService.GetActiveSessionsAsync();
        return Ok(result);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<SessionResponseDto>>> UpdateSession(int id, [FromBody] SessionCreateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<SessionResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _sessionService.UpdateSessionAsync(id, updateDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteSession(int id)
    {
        var result = await _sessionService.DeleteSessionAsync(id);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    [HttpPost("{id}/pass-score")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdatePassScore(int id, [FromBody] UpdatePassScoreDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<bool>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _sessionService.UpdatePassScoreAsync(id, dto.PassScore);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    [HttpGet("{id}/participants")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<SessionParticipantDto>>>> GetSessionParticipants(int id)
    {
        var result = await _sessionService.GetSessionParticipantsAsync(id);
        return Ok(result);
    }
    
    [HttpPost("{id}/participants")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignParticipants(int id, [FromBody] AssignParticipantsDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<bool>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var assignedBy = GetCurrentUserId();
        var result = await _sessionService.AssignParticipantsAsync(id, dto.ParticipantIds, assignedBy, dto.TrainingDate);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    [HttpDelete("{sessionId}/participants/{personnelId}")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveParticipant(int sessionId, int personnelId)
    {
        var result = await _sessionService.RemoveParticipantAsync(sessionId, personnelId);
        
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
}
