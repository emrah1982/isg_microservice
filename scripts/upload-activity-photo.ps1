param(
  [Parameter(Mandatory=$true)][string]$FilePath,
  [Parameter(Mandatory=$true)][ValidateSet('warning','penalty','correctiveaction','preventiveaction','incident','observation','report')][string]$EntityType,
  [Parameter(Mandatory=$true)][int]$EntityId,
  [string]$Caption = "",
  [string]$ApiBase = "http://localhost:8091",
  [string]$ApiKey = "changeme"
)

$ErrorActionPreference = 'Stop'

if (!(Test-Path -LiteralPath $FilePath)) { throw "Dosya bulunamadı: $FilePath" }

# 10MB kontrolü
$size = (Get-Item -LiteralPath $FilePath).Length
if ($size -gt 10MB) { throw "Dosya boyutu 10MB'ı geçmemelidir. Mevcut: $([math]::Round($size/1MB,2)) MB" }

# MIME tipi kontrolü (temel)
$ext = [IO.Path]::GetExtension($FilePath).ToLower()
$mime = switch ($ext) {
  '.jpg' { 'image/jpeg' }
  '.jpeg' { 'image/jpeg' }
  '.png' { 'image/png' }
  '.webp' { 'image/webp' }
  Default { '' }
}
if ([string]::IsNullOrWhiteSpace($mime)) { throw "İzin verilen MIME türleri: image/jpeg, image/png, image/webp" }

$uri = "$ApiBase/api/photos/$EntityType/$EntityId"
Write-Host "Yükleniyor: $FilePath -> $uri" -ForegroundColor Cyan

# PowerShell 7+: -Form ile multipart kolay
try {
  $headers = @{ 'X-Api-Key' = $ApiKey }
  $form = @{
    file = Get-Item -LiteralPath $FilePath
    caption = $Caption
  }
  $resp = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Form $form
  Write-Host "Yüklendi. PhotoId: $($resp.id) | Path: $($resp.storedPath)" -ForegroundColor Green
} catch {
  Write-Error $_
  throw "Yükleme başarısız. Ayrıntılar yukarıda."
}
