using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using TrainingsService.DTOs;
using TrainingsService.Entities;
using TrainingsService.Repositories;

namespace TrainingsService.Services;

public class TrainingSessionService : ITrainingSessionService
{
    private readonly ITrainingSessionRepository _sessionRepository;
    private readonly ITrainingRepository _trainingRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TrainingSessionService> _logger;
    
    public TrainingSessionService(
        ITrainingSessionRepository sessionRepository,
        ITrainingRepository trainingRepository,
        IHttpClientFactory httpClientFactory,
        ILogger<TrainingSessionService> logger)
    {
        _sessionRepository = sessionRepository;
        _trainingRepository = trainingRepository;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }
    
    public async Task<ApiResponse<SessionResponseDto>> CreateSessionAsync(SessionCreateDto createDto)
    {
        var training = await _trainingRepository.GetByIdAsync(createDto.TrainingId);
        if (training == null)
        {
            return ApiResponse<SessionResponseDto>.ErrorResponse("Eğitim bulunamadı.");
        }
        
        var session = new TrainingSession
        {
            TrainingId = createDto.TrainingId,
            SessionDate = createDto.SessionDate,
            SessionEndDate = createDto.SessionEndDate,
            Branch = createDto.Branch,
            Location = createDto.Location,
            Instructor = createDto.Instructor,
            PassScore = createDto.PassScore,
            MaxParticipants = createDto.MaxParticipants,
            Notes = createDto.Notes,
            IsActive = true
        };
        
        var created = await _sessionRepository.CreateAsync(session);
        
        var responseDto = MapToResponseDto(created, training.Title);
        return ApiResponse<SessionResponseDto>.SuccessResponse(responseDto, "Oturum başarıyla oluşturuldu.");
    }
    
    public async Task<ApiResponse<SessionResponseDto>> GetSessionByIdAsync(int id)
    {
        var session = await _sessionRepository.GetByIdAsync(id);
        if (session == null)
        {
            return ApiResponse<SessionResponseDto>.ErrorResponse("Oturum bulunamadı.");
        }
        
        var responseDto = MapToResponseDto(session, session.Training?.Title ?? "");
        return ApiResponse<SessionResponseDto>.SuccessResponse(responseDto);
    }
    
    public async Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetAllSessionsAsync()
    {
        var sessions = await _sessionRepository.GetAllAsync();
        var responseDtos = sessions.Select(s => MapToResponseDto(s, s.Training?.Title ?? "")).ToList();
        return ApiResponse<IEnumerable<SessionResponseDto>>.SuccessResponse(responseDtos);
    }
    
    public async Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetSessionsByTrainingIdAsync(int trainingId)
    {
        var sessions = await _sessionRepository.GetByTrainingIdAsync(trainingId);
        var responseDtos = sessions.Select(s => MapToResponseDto(s, s.Training?.Title ?? "")).ToList();
        return ApiResponse<IEnumerable<SessionResponseDto>>.SuccessResponse(responseDtos);
    }
    
    public async Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetActiveSessionsAsync()
    {
        var sessions = await _sessionRepository.GetActiveSessionsAsync();
        var responseDtos = sessions.Select(s => MapToResponseDto(s, s.Training?.Title ?? "")).ToList();
        return ApiResponse<IEnumerable<SessionResponseDto>>.SuccessResponse(responseDtos);
    }
    
    public async Task<ApiResponse<SessionResponseDto>> UpdateSessionAsync(int id, SessionCreateDto updateDto)
    {
        var session = await _sessionRepository.GetByIdAsync(id);
        if (session == null)
        {
            return ApiResponse<SessionResponseDto>.ErrorResponse("Oturum bulunamadı.");
        }
        
        var training = await _trainingRepository.GetByIdAsync(updateDto.TrainingId);
        if (training == null)
        {
            return ApiResponse<SessionResponseDto>.ErrorResponse("Eğitim bulunamadı.");
        }
        
        session.TrainingId = updateDto.TrainingId;
        session.SessionDate = updateDto.SessionDate;
        session.SessionEndDate = updateDto.SessionEndDate;
        session.Branch = updateDto.Branch;
        session.Location = updateDto.Location;
        session.Instructor = updateDto.Instructor;
        session.PassScore = updateDto.PassScore;
        session.MaxParticipants = updateDto.MaxParticipants;
        session.Notes = updateDto.Notes;
        
        var updated = await _sessionRepository.UpdateAsync(session);
        
        var responseDto = MapToResponseDto(updated, training.Title);
        return ApiResponse<SessionResponseDto>.SuccessResponse(responseDto, "Oturum başarıyla güncellendi.");
    }
    
    public async Task<ApiResponse<bool>> DeleteSessionAsync(int id)
    {
        var session = await _sessionRepository.GetByIdAsync(id);
        if (session == null)
        {
            return ApiResponse<bool>.ErrorResponse("Oturum bulunamadı.");
        }
        
        await _sessionRepository.DeleteAsync(id);
        return ApiResponse<bool>.SuccessResponse(true, "Oturum başarıyla silindi.");
    }
    
    public async Task<ApiResponse<bool>> UpdatePassScoreAsync(int sessionId, int passScore)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        if (session == null)
        {
            return ApiResponse<bool>.ErrorResponse("Oturum bulunamadı.");
        }
        
        session.PassScore = passScore;
        await _sessionRepository.UpdateAsync(session);
        
        return ApiResponse<bool>.SuccessResponse(true, "Geçme notu başarıyla güncellendi.");
    }
    
    public async Task<ApiResponse<IEnumerable<SessionParticipantDto>>> GetSessionParticipantsAsync(int sessionId)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        if (session == null)
        {
            return ApiResponse<IEnumerable<SessionParticipantDto>>.ErrorResponse("Oturum bulunamadı.");
        }
        
        var participants = await _sessionRepository.GetSessionParticipantsAsync(sessionId);
        var dtos = participants.Select(p => new SessionParticipantDto
        {
            Id = p.Id,
            SessionId = p.SessionId,
            PersonnelId = p.PersonnelId,
            AttendanceStatus = p.AttendanceStatus,
            Score = p.Score,
            Passed = p.Passed,
            Notes = p.Notes,
            RegisteredDate = p.RegisteredDate,
            RegisteredBy = p.RegisteredBy
        }).ToList();
        
        return ApiResponse<IEnumerable<SessionParticipantDto>>.SuccessResponse(dtos);
    }
    
    public async Task<ApiResponse<bool>> AssignParticipantsAsync(int sessionId, List<int> participantIds, int? assignedBy = null, DateTime? trainingDate = null)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        if (session == null)
        {
            return ApiResponse<bool>.ErrorResponse("Oturum bulunamadı.");
        }
        
        var newParticipants = new List<SessionParticipant>();
        
        foreach (var personnelId in participantIds)
        {
            var existing = await _sessionRepository.GetParticipantAsync(sessionId, personnelId);
            if (existing == null)
            {
                newParticipants.Add(new SessionParticipant
                {
                    SessionId = sessionId,
                    PersonnelId = personnelId,
                    AttendanceStatus = "Registered",
                    RegisteredDate = DateTime.UtcNow,
                    RegisteredBy = assignedBy
                });
            }
        }
        
        if (newParticipants.Any())
        {
            await _sessionRepository.AddParticipantsAsync(newParticipants);
            
            // Eğitim tarihi belirtilmişse, PersonnelService'e gönder
            if (trainingDate.HasValue)
            {
                try
                {
                    var httpClient = _httpClientFactory.CreateClient("PersonnelService");
                    foreach (var personnelId in participantIds)
                    {
                        // Önce mevcut personel bilgilerini al
                        var getResponse = await httpClient.GetAsync($"/api/personnel/{personnelId}");
                        if (getResponse.IsSuccessStatusCode)
                        {
                            var personnelJson = await getResponse.Content.ReadAsStringAsync();
                            var personnel = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(personnelJson);
                            
                            // Personnel objesini güncelle
                            var updateDto = new
                            {
                                id = personnel.GetProperty("id").GetInt32(),
                                firstName = personnel.GetProperty("firstName").GetString(),
                                lastName = personnel.GetProperty("lastName").GetString(),
                                nationalId = personnel.TryGetProperty("nationalId", out var natId) ? natId.GetString() : null,
                                email = personnel.TryGetProperty("email", out var em) ? em.GetString() : null,
                                phone = personnel.TryGetProperty("phone", out var ph) ? ph.GetString() : null,
                                companyId = personnel.TryGetProperty("companyId", out var cid) && cid.ValueKind != System.Text.Json.JsonValueKind.Null ? (int?)cid.GetInt32() : null,
                                department = personnel.TryGetProperty("department", out var dep) ? dep.GetString() : null,
                                title = personnel.TryGetProperty("title", out var tit) ? tit.GetString() : null,
                                position = personnel.TryGetProperty("position", out var pos) ? pos.GetString() : null,
                                startDate = personnel.TryGetProperty("startDate", out var sd) && sd.ValueKind != System.Text.Json.JsonValueKind.Null ? sd.GetString() : null,
                                isgTemelEgitimBelgesiTarihi = trainingDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                                status = personnel.TryGetProperty("status", out var st) ? st.GetString() : "Active"
                            };
                            
                            await httpClient.PutAsJsonAsync($"/api/personnel/{personnelId}", updateDto);
                            _logger.LogInformation("Personel {PersonnelId} için eğitim tarihi güncellendi: {Date}", personnelId, trainingDate.Value);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Eğitim tarihi güncellenirken hata oluştu.");
                    // Hata olsa bile katılımcı ataması başarılı sayılır
                }
            }
        }
        
        return ApiResponse<bool>.SuccessResponse(true, $"{newParticipants.Count} katılımcı başarıyla eklendi.");
    }
    
    public async Task<ApiResponse<bool>> RemoveParticipantAsync(int sessionId, int personnelId)
    {
        var participant = await _sessionRepository.GetParticipantAsync(sessionId, personnelId);
        if (participant == null)
        {
            return ApiResponse<bool>.ErrorResponse("Katılımcı bulunamadı.");
        }
        
        await _sessionRepository.RemoveParticipantAsync(sessionId, personnelId);
        return ApiResponse<bool>.SuccessResponse(true, "Katılımcı başarıyla kaldırıldı.");
    }
    
    private static SessionResponseDto MapToResponseDto(TrainingSession session, string trainingTitle)
    {
        return new SessionResponseDto
        {
            Id = session.Id,
            TrainingId = session.TrainingId,
            TrainingTitle = trainingTitle,
            SessionDate = session.SessionDate,
            SessionEndDate = session.SessionEndDate,
            Branch = session.Branch,
            Location = session.Location,
            Instructor = session.Instructor,
            PassScore = session.PassScore,
            MaxParticipants = session.MaxParticipants,
            Notes = session.Notes,
            IsActive = session.IsActive,
            ParticipantCount = session.Participants?.Count ?? 0,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt
        };
    }
}
