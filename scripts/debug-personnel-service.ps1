# PersonnelService Debug Script
Write-Host "=== PersonnelService Debug Testi ===" -ForegroundColor Green

# 1. Service health check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8089/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Service Health: OK" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Service Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Personnel health check
Write-Host "`n2. Personnel Health Check..." -ForegroundColor Yellow
try {
    $personnelHealthResponse = Invoke-RestMethod -Uri "http://localhost:8089/api/personnel/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Personnel Health: OK" -ForegroundColor Green
    Write-Host "Response: $($personnelHealthResponse | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Personnel Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. List personnel
Write-Host "`n3. List Personnel..." -ForegroundColor Yellow
try {
    $personnelList = Invoke-RestMethod -Uri "http://localhost:8089/api/personnel" -Method GET -TimeoutSec 10
    Write-Host "✅ Personnel List: OK" -ForegroundColor Green
    Write-Host "Personnel Count: $($personnelList.Count)" -ForegroundColor Cyan
    if ($personnelList.Count -gt 0) {
        Write-Host "First Personnel: $($personnelList[0] | ConvertTo-Json)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Personnel List Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. List companies
Write-Host "`n4. List Companies..." -ForegroundColor Yellow
try {
    $companiesList = Invoke-RestMethod -Uri "http://localhost:8089/api/companies" -Method GET -TimeoutSec 10
    Write-Host "✅ Companies List: OK" -ForegroundColor Green
    Write-Host "Companies Count: $($companiesList.Count)" -ForegroundColor Cyan
    if ($companiesList.Count -gt 0) {
        Write-Host "Available Companies:" -ForegroundColor Cyan
        foreach ($company in $companiesList) {
            Write-Host "  - ID: $($company.id), Name: $($company.name)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Companies List Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test personnel update (if personnel exists)
Write-Host "`n5. Test Personnel Update..." -ForegroundColor Yellow
try {
    $personnelList = Invoke-RestMethod -Uri "http://localhost:8089/api/personnel" -Method GET -TimeoutSec 10
    if ($personnelList.Count -gt 0) {
        $testPersonnel = $personnelList[0]
        $updateData = @{
            firstName = $testPersonnel.firstName
            lastName = $testPersonnel.lastName
            email = $testPersonnel.email
            phone = $testPersonnel.phone
            nationalId = $testPersonnel.nationalId
            companyId = $testPersonnel.companyId
            department = $testPersonnel.department
            title = $testPersonnel.title
            position = $testPersonnel.position
            startDate = $testPersonnel.startDate
            status = $testPersonnel.status
        }
        
        $updateJson = $updateData | ConvertTo-Json
        Write-Host "Update Data: $updateJson" -ForegroundColor Cyan
        
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8089/api/personnel/$($testPersonnel.id)" -Method PUT -Body $updateJson -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ Personnel Update: OK" -ForegroundColor Green
        Write-Host "Updated Personnel: $($updateResponse | ConvertTo-Json)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ No personnel found to test update" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Personnel Update Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Debug Testi Tamamlandı ===" -ForegroundColor Green
