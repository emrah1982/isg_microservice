# Test API update çağrısı
$body = @{
    status = "InProgress"
    notes = "Test güncelleme"
    checklistResponsesJson = '[{"itemId":1,"itemText":"Test madde","isRequired":true,"responseType":"checkbox","booleanValue":true,"isCompliant":true,"isCritical":false,"responseDate":"2025-10-16T14:12:00Z","notes":"Test notu"}]'
} | ConvertTo-Json -Depth 10

Write-Host "API çağrısı yapılıyor..."
Write-Host "URL: http://localhost:8091/api/controlformexecutions/1"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8091/api/controlformexecutions/3" -Method PUT -ContentType "application/json" -Body $body
    Write-Host "✅ Başarılı! Status: $($response.StatusCode)"
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
