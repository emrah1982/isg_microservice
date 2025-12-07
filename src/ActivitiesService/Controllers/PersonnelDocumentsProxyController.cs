using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonnelDocumentsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public PersonnelDocumentsController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    private HttpClient CreateClient() => _httpClientFactory.CreateClient("PersonnelService");

    // GET api/personneldocuments/types
    [HttpGet("types")]
    public async Task<IActionResult> GetTypes()
    {
        var client = CreateClient();
        var resp = await client.GetAsync("/api/personneldocuments/types");
        var content = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, content);
    }

    // GET api/personneldocuments/test
    [HttpGet("test")]
    public async Task<IActionResult> Test()
    {
        var client = CreateClient();
        var resp = await client.GetAsync("/api/personneldocuments/test");
        var content = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, content);
    }

    // GET api/personneldocuments/personnel/{personnelId}/status
    [HttpGet("personnel/{personnelId:int}/status")]
    public async Task<IActionResult> GetStatus(int personnelId)
    {
        var client = CreateClient();
        var resp = await client.GetAsync($"/api/personneldocuments/personnel/{personnelId}/status");
        var content = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, content);
    }

    // GET api/personneldocuments/personnel/{personnelId}
    [HttpGet("personnel/{personnelId:int}")]
    public async Task<IActionResult> GetPersonnelDocuments(int personnelId)
    {
        var client = CreateClient();
        var resp = await client.GetAsync($"/api/personneldocuments/personnel/{personnelId}");
        var content = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, content);
    }

    // POST api/personneldocuments/upload
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB
    public async Task<IActionResult> Upload()
    {
        if (!Request.HasFormContentType)
            return BadRequest("Form-data bekleniyor");

        var form = await Request.ReadFormAsync();
        if (!form.Files.Any())
            return BadRequest("Dosya bulunamadı");

        var client = CreateClient();

        using var content = new MultipartFormDataContent();
        // Forward normal fields
        foreach (var field in form)
        {
            content.Add(new StringContent(field.Value.ToString()), field.Key);
        }
        // Forward file(s) - only first is expected
        var file = form.Files[0];
        using var stream = file.OpenReadStream();
        var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/pdf");
        content.Add(fileContent, "File", file.FileName);

        var resp = await client.PostAsync("/api/personneldocuments/upload", content);
        var respBody = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, respBody);
    }

    // GET api/personneldocuments/{id}/download
    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var client = CreateClient();
        var resp = await client.GetAsync($"/api/personneldocuments/{id}/download", HttpCompletionOption.ResponseHeadersRead);
        if (!resp.IsSuccessStatusCode)
        {
            var errText = await resp.Content.ReadAsStringAsync();
            return StatusCode((int)resp.StatusCode, errText);
        }

        var contentType = resp.Content.Headers.ContentType?.ToString() ?? "application/pdf";
        var fileName = resp.Content.Headers.ContentDisposition?.FileNameStar
                        ?? resp.Content.Headers.ContentDisposition?.FileName
                        ?? "document.pdf";

        var stream = await resp.Content.ReadAsStreamAsync();
        return File(stream, contentType, fileName);
    }

    // POST api/personneldocuments/{id}/approve
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] object body)
    {
        var client = CreateClient();
        var json = System.Text.Json.JsonSerializer.Serialize(body);
        var resp = await client.PostAsync($"/api/personneldocuments/{id}/approve",
            new StringContent(json, System.Text.Encoding.UTF8, "application/json"));
        var content = await resp.Content.ReadAsStringAsync();
        return StatusCode((int)resp.StatusCode, content);
    }
}
