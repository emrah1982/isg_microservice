# Runs ActivitiesService in Docker using compose with override
param(
    [string]$ApiKey = "changeme",
    [string]$DbConn = "server=personnel_db;port=3306;database=activities_db;user=root;password=example"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting ActivitiesService with API key '$ApiKey'..." -ForegroundColor Cyan

# Export env vars for compose
$env:ACTIVITIES_API_KEY = $ApiKey
$env:ACTIVITIES_DB = $DbConn

# Compose up service (merge base compose with activities override)
# NOTE: Assumes you are in repo root: c:\Users\User\Desktop\isg_microservice

docker compose -f "docker-compose.yml" -f "scripts/activities-compose.override.yml" up -d --build activities-service

if ($LASTEXITCODE -ne 0) {
  throw "docker compose failed with exit code $LASTEXITCODE"
}

Write-Host "ActivitiesService is starting on http://localhost:8091" -ForegroundColor Green
Write-Host "Swagger: http://localhost:8091/swagger" -ForegroundColor Green
Write-Host "Uploads dir is persisted in a Docker volume (activities_uploads)." -ForegroundColor Yellow
