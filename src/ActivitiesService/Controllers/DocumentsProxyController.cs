using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public DocumentsController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    private HttpClient CreateClient() => _httpClientFactory.CreateClient("DocumentsService");

    // Stream download from DocumentsService
    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var client = CreateClient();
        var resp = await client.GetAsync($"/api/documents/{id}/download", HttpCompletionOption.ResponseHeadersRead);
        if (!resp.IsSuccessStatusCode)
        {
            var txt = await resp.Content.ReadAsStringAsync();
            return StatusCode((int)resp.StatusCode, txt);
        }

        var contentType = resp.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
        var fileName = resp.Content.Headers.ContentDisposition?.FileNameStar
                        ?? resp.Content.Headers.ContentDisposition?.FileName
                        ?? $"document-{id}";

        var stream = await resp.Content.ReadAsStreamAsync();
        return File(stream, contentType, fileName);
    }
}
