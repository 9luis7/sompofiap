# Teste de predição de risco
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    uf = "SP"
    br = "116"
    km = 523
    hour = 22
    dayOfWeek = 5
    weatherCondition = "chuva"
} | ConvertTo-Json

Write-Host "Testando predição de risco..." -ForegroundColor Yellow
Write-Host ""

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/risk/predict" -Method Post -Headers $headers -Body $body

Write-Host "✅ Sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Segmento: $($response.data.segment_key)" -ForegroundColor Cyan
Write-Host "Score de Risco: $($response.data.risk_score)" -ForegroundColor Cyan
Write-Host "Nível de Risco: $($response.data.risk_level)" -ForegroundColor $(if ($response.data.risk_level -eq "critico") { "Red" } elseif ($response.data.risk_level -eq "alto") { "Yellow" } else { "Green" })
Write-Host "Contexto: $($response.data.context_used)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recomendações:" -ForegroundColor Yellow
$response.data.recommendations | ForEach-Object {
    Write-Host "  - $_"
}

