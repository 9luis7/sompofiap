#Requires -Version 5.1
# Sompo Monitoring System - PowerShell Setup Script

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Sompo Monitoring System - Setup"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 SOMPO MONITORING SYSTEM" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando configuração automática..." -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js não encontrado"
    }
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se Python está instalado
Write-Host ""
Write-Host "[2/5] Verificando Python..." -ForegroundColor Blue
try {
    $pythonVersion = python --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python não encontrado"
    }
} catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Python em: https://python.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências Node.js
Write-Host ""
Write-Host "[3/5] Instalando dependências Node.js..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências Node.js" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    Write-Host "✅ Dependências Node.js instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependências Node.js já instaladas" -ForegroundColor Green
}

# Instalar dependências Python
Write-Host ""
Write-Host "[4/5] Instalando dependências Python..." -ForegroundColor Blue
Write-Host "📦 Instalando ferramentas de qualidade Python..." -ForegroundColor Yellow
python -m pip install flake8 black isort
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências Python" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Dependências Python instaladas" -ForegroundColor Green

# Verificar qualidade do código
Write-Host ""
Write-Host "[5/5] Verificando qualidade do código..." -ForegroundColor Blue
Write-Host "🔍 Executando linters..." -ForegroundColor Yellow
npm run quality
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Alguns problemas de qualidade encontrados" -ForegroundColor Yellow
    Write-Host "Executando correções automáticas..." -ForegroundColor Yellow
    npm run lint
    npm run format
} else {
    Write-Host "✅ Código verificado com sucesso" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando sistema em terminais separados..." -ForegroundColor Green
Write-Host ""

# Abrir terminal para o backend
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$Host.UI.RawUI.WindowTitle = 'Sompo Backend'; Write-Host '🚀 Iniciando Backend...' -ForegroundColor Green; npm run backend"

# Aguardar um pouco para o backend inicializar
Start-Sleep -Seconds 3

# Abrir terminal para o frontend
Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$Host.UI.RawUI.WindowTitle = 'Sompo Frontend'; Write-Host '🌐 Iniciando Frontend...' -ForegroundColor Green; Start-Sleep -Seconds 2; npm run frontend"

Write-Host ""
Write-Host "✅ Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Enter para fechar este terminal..." -ForegroundColor Yellow
Read-Host
