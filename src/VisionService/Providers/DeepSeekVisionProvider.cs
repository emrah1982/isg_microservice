using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using VisionService.DTOs;

namespace VisionService.Providers;

public class DeepSeekVisionProvider : IVisionProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DeepSeekVisionProvider> _logger;
    private readonly IConfiguration _configuration;

    public DeepSeekVisionProvider(HttpClient httpClient, ILogger<DeepSeekVisionProvider> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<VisionResponseDto> AnalyzeAsync(string base64Image, double threshold, CancellationToken ct = default)
    {
        // Config
        var apiKey = _configuration["DeepSeek:ApiKey"] ?? Environment.GetEnvironmentVariable("DEEPSEEK_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("DeepSeek API key is missing. Please set DEEPSEEK_API_KEY or appsettings DeepSeek:ApiKey.");
        }

        var endpoint = _configuration["DeepSeek:Endpoint"] ?? "https://api.deepseek.com/v1/chat/completions";
        var model = _configuration["DeepSeek:Model"] ?? "deepseek-vl";

        // Prompt that enforces strict JSON
        var systemPrompt = "You are an EHS (occupational safety) visual compliance inspector. Analyze the image and strictly return JSON with violations.";
        var userPrompt = $@"Detect safety violations in this image. Focus on items such as: missing helmet, missing safety vest, smoking, phone usage, missing safety harness, fall hazard, missing mask, missing goggles, missing gloves, unsafe ladder use, blocked exit.
Return STRICT JSON with this exact schema (no additional text):
{{
  ""violations"": [
    {{ ""type"": string, ""confidence"": number (0..1), ""severity"": oneOf(['Low','Medium','High']), ""bbox"": [x,y,w,h] or null, ""explanation"": string }}
  ],
  ""summary"": string
}}
Use a confidence threshold filter >= {threshold:0.00}. If nothing is found, return an empty array for violations.";

        // Build a DeepSeek-VL style request body. Many vision APIs accept base64 with a data URL.
        // We'll pass the base64 directly inside the prompt as an image block if supported, else textual reference.
        var payload = new
        {
            model = model,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = new object[]
                    {
                        new { type = "input_text", text = userPrompt },
                        new { type = "input_image", image_base64 = base64Image }
                    }
                }
            },
            temperature = 0.1
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, ct);
        var content = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("DeepSeek API error: {Status} - {Content}", response.StatusCode, content);
            throw new ApplicationException($"DeepSeek API error: {response.StatusCode}");
        }

        // The response format may vary by provider. We'll try to extract the assistant content text and parse JSON from it.
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;
        string? assistantText = null;

        if (root.TryGetProperty("choices", out var choices) && choices.ValueKind == JsonValueKind.Array && choices.GetArrayLength() > 0)
        {
            var choice = choices[0];
            if (choice.TryGetProperty("message", out var message))
            {
                if (message.TryGetProperty("content", out var msgContent))
                {
                    // Some providers return content as string
                    if (msgContent.ValueKind == JsonValueKind.String)
                    {
                        assistantText = msgContent.GetString();
                    }
                    else if (msgContent.ValueKind == JsonValueKind.Array && msgContent.GetArrayLength() > 0)
                    {
                        // Or as structured blocks: pick first text block
                        foreach (var part in msgContent.EnumerateArray())
                        {
                            if (part.TryGetProperty("type", out var t) && t.GetString() == "output_text" && part.TryGetProperty("text", out var t2))
                            {
                                assistantText = t2.GetString();
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (string.IsNullOrWhiteSpace(assistantText))
        {
            _logger.LogWarning("DeepSeek response did not include expected assistant text. Falling back to empty result.");
            return new VisionResponseDto { Violations = new(), Summary = string.Empty };
        }

        // Try parse JSON
        try
        {
            var parsed = JsonSerializer.Deserialize<VisionResponseDto>(assistantText!, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return parsed ?? new VisionResponseDto { Violations = new(), Summary = string.Empty };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse DeepSeek JSON. Raw: {AssistantText}", assistantText);
            return new VisionResponseDto
            {
                Violations = new(),
                Summary = assistantText // Return raw text for troubleshooting
            };
        }
    }
}
