using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonnelController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    public PersonnelController(IHttpClientFactory httpClientFactory) 
    { 
        _httpClientFactory = httpClientFactory; 
    }

    [HttpGet("search/{tcNo}")]
    public async Task<IActionResult> SearchByTcNo(string tcNo)
    {
        if (string.IsNullOrWhiteSpace(tcNo) || tcNo.Length != 11)
            return BadRequest("Geçerli bir TC No giriniz (11 haneli)");

        try
        {
            var client = _httpClientFactory.CreateClient("PersonnelService");
            
            // PersonnelService'den TC No ile arama
            var response = await client.GetAsync($"/api/personnel/search?tcNo={tcNo}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var personnel = JsonSerializer.Deserialize<PersonnelSearchResult>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                return Ok(personnel);
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound(new { message = "Bu TC No ile personel bulunamadı" });
            }
            else
            {
                return StatusCode(500, new { message = "Personel servisi ile iletişim hatası" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Personel arama sırasında hata oluştu", error = ex.Message });
        }
    }

    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies()
    {
        try
        {
            var client = _httpClientFactory.CreateClient("PersonnelService");
            var response = await client.GetAsync("/api/companies");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(content));
            }
            
            return StatusCode(500, new { message = "Firma listesi alınamadı" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Firma listesi alınırken hata oluştu", error = ex.Message });
        }
    }
}

public class PersonnelSearchResult
{
    public int Id { get; set; }
    public string? TcNo { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public int? CompanyId { get; set; }
    public string? CompanyName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
}
