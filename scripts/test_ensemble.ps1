# Script de Teste do Sistema de Ensemble - Sompo
# ================================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   TESTE DO SISTEMA DE ENSEMBLE - SOMPO    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/v1"

# Função para fazer requisição HTTP
function Invoke-APIRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    try {
        $url = "$baseUrl$Endpoint"
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method
        }
        
        return $response
    } catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Verificar se o servidor está rodando
Write-Host "1. Verificando se o servidor está ativo..." -ForegroundColor Yellow
$healthCheck = Invoke-APIRequest -Method "GET" -Endpoint "/"
if ($healthCheck) {
    Write-Host "   ✅ Servidor ativo (v$($healthCheck.version))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Servidor não está respondendo. Execute .\start.bat primeiro!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Testar health check do ensemble
Write-Host "2. Testando health check do ensemble..." -ForegroundColor Yellow
$ensembleHealth = Invoke-APIRequest -Method "GET" -Endpoint "/ensemble/health"
if ($ensembleHealth -and $ensembleHealth.success) {
    Write-Host "   ✅ Ensemble health check OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Ensemble health check falhou" -ForegroundColor Red
}
Write-Host ""

# Obter informações do ensemble
Write-Host "3. Obtendo informações do ensemble..." -ForegroundColor Yellow
$ensembleInfo = Invoke-APIRequest -Method "GET" -Endpoint "/ensemble/info"
if ($ensembleInfo -and $ensembleInfo.success) {
    Write-Host "   ✅ Sistema: $($ensembleInfo.data.name)" -ForegroundColor Green
    Write-Host "   📊 Modelos disponíveis:" -ForegroundColor Cyan
    Write-Host "      - Risk Model: $($ensembleInfo.data.models.risk_model.name)" -ForegroundColor White
    Write-Host "      - Classification Model: $($ensembleInfo.data.models.classification_model.name)" -ForegroundColor White
} else {
    Write-Host "   ❌ Não foi possível obter informações" -ForegroundColor Red
}
Write-Host ""

# Teste 1: Predição de Baixo Risco
Write-Host "4. Teste 1: Predição de BAIXO RISCO..." -ForegroundColor Yellow
$test1 = @{
    uf = "SP"
    br = "101"
    km = 85
    hour = 14
    weatherCondition = "claro"
    dayOfWeek = 2
}
$result1 = Invoke-APIRequest -Method "POST" -Endpoint "/ensemble/predict" -Body $test1
if ($result1 -and $result1.success) {
    Write-Host "   📍 Local: $($result1.data.metadata.location)" -ForegroundColor Cyan
    Write-Host "   📊 Risk Score: $($result1.data.risk_score)" -ForegroundColor White
    Write-Host "   🎯 Risk Level: $($result1.data.risk_level)" -ForegroundColor $(if ($result1.data.risk_level -eq "baixo") { "Green" } else { "Yellow" })
    Write-Host "   🔍 Classificação: $($result1.data.accident_classification)" -ForegroundColor White
    Write-Host "   🤝 Modelos concordam: $($result1.data.ensemble.models_agree)" -ForegroundColor White
    Write-Host "   ⭐ Confiança: $($result1.data.ensemble.confidence_level)" -ForegroundColor White
    Write-Host "   ✅ Teste 1 passou!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Teste 1 falhou" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Predição de Alto Risco
Write-Host "5. Teste 2: Predição de ALTO RISCO..." -ForegroundColor Yellow
$test2 = @{
    uf = "SP"
    br = "116"
    km = 523
    hour = 22
    weatherCondition = "chuvoso"
    dayOfWeek = 6
}
$result2 = Invoke-APIRequest -Method "POST" -Endpoint "/ensemble/predict" -Body $test2
if ($result2 -and $result2.success) {
    Write-Host "   📍 Local: $($result2.data.metadata.location)" -ForegroundColor Cyan
    Write-Host "   📊 Risk Score: $($result2.data.risk_score)" -ForegroundColor White
    Write-Host "   🎯 Risk Level: $($result2.data.risk_level)" -ForegroundColor $(if ($result2.data.risk_level -eq "critico" -or $result2.data.risk_level -eq "alto") { "Red" } else { "Yellow" })
    Write-Host "   🔍 Classificação: $($result2.data.accident_classification)" -ForegroundColor White
    Write-Host "   🤝 Modelos concordam: $($result2.data.ensemble.models_agree)" -ForegroundColor White
    Write-Host "   ⭐ Confiança: $($result2.data.ensemble.confidence_level)" -ForegroundColor White
    
    if ($result2.data.ensemble.inconsistencies.Count -gt 0) {
        Write-Host "   ⚠️  Inconsistências detectadas:" -ForegroundColor Yellow
        foreach ($inc in $result2.data.ensemble.inconsistencies) {
            Write-Host "      - $inc" -ForegroundColor Yellow
        }
    }
    
    Write-Host "   📋 Recomendações:" -ForegroundColor Cyan
    $result2.data.recommendations | ForEach-Object {
        Write-Host "      • $_" -ForegroundColor White
    }
    
    Write-Host "   ✅ Teste 2 passou!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Teste 2 falhou" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Predição em Lote
Write-Host "6. Teste 3: Predição em LOTE (múltiplas localizações)..." -ForegroundColor Yellow
$test3 = @{
    predictions = @(
        @{ uf = "SP"; br = "116"; km = 523; hour = 22; weatherCondition = "chuvoso" },
        @{ uf = "RJ"; br = "101"; km = 85; hour = 14; weatherCondition = "claro" },
        @{ uf = "MG"; br = "381"; km = 530; hour = 18; weatherCondition = "nublado" }
    )
}
$result3 = Invoke-APIRequest -Method "POST" -Endpoint "/ensemble/batch" -Body $test3
if ($result3 -and $result3.success) {
    Write-Host "   📊 Total de predições: $($result3.data.total)" -ForegroundColor Cyan
    Write-Host "   ✅ Sucesso: $($result3.data.successful)" -ForegroundColor Green
    Write-Host "   ❌ Falhas: $($result3.data.failed)" -ForegroundColor $(if ($result3.data.failed -gt 0) { "Red" } else { "Green" })
    
    Write-Host "   📋 Resultados:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $result3.data.results.Count; $i++) {
        $pred = $result3.data.results[$i]
        if ($pred.metadata) {
            Write-Host "      $($i+1). $($pred.metadata.location) - Score: $($pred.risk_score) ($($pred.risk_level))" -ForegroundColor White
        }
    }
    
    Write-Host "   ✅ Teste 3 passou!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Teste 3 falhou" -ForegroundColor Red
}
Write-Host ""

# Teste 4: Status das APIs
Write-Host "7. Teste 4: Verificando status das APIs de ML..." -ForegroundColor Yellow
$status = Invoke-APIRequest -Method "GET" -Endpoint "/ensemble/status"
if ($status -and $status.success) {
    Write-Host "   ✅ Status obtido com sucesso" -ForegroundColor Green
    Write-Host "   📡 Serviço: $($status.data.service)" -ForegroundColor White
    Write-Host "   ⏰ Timestamp: $($status.data.timestamp)" -ForegroundColor White
} else {
    Write-Host "   ❌ Não foi possível obter status" -ForegroundColor Red
}
Write-Host ""

# Resumo dos Testes
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "            RESUMO DOS TESTES               " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 4
$passedTests = 0

if ($ensembleHealth -and $ensembleHealth.success) { $passedTests++ }
if ($result1 -and $result1.success) { $passedTests++ }
if ($result2 -and $result2.success) { $passedTests++ }
if ($result3 -and $result3.success) { $passedTests++ }

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "Testes executados: $totalTests" -ForegroundColor White
Write-Host "Testes aprovados: $passedTests" -ForegroundColor Green
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host "   O sistema de ensemble está funcionando perfeitamente." -ForegroundColor Green
} else {
    Write-Host "⚠️  ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    Write-Host "   Verifique os logs acima para detalhes." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Informações adicionais
Write-Host "📚 Documentação completa: docs/ensemble/ENSEMBLE_SYSTEM.md" -ForegroundColor Cyan
Write-Host "🔧 Para retreinar modelos: python scripts\train_risk_model.py" -ForegroundColor Cyan
Write-Host ""

