@echo off
chcp 65001 >nul
title Sompo Monitoring System - Setup

echo.
echo ========================================
echo   🚀 SOMPO MONITORING SYSTEM
echo ========================================
echo.
echo Iniciando configuração automática...
echo.

:: Verificar se Node.js está instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version

:: Verificar se Python está instalado
echo.
echo [2/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo Por favor, instale o Python em: https://python.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Python encontrado:
python --version

:: Instalar dependências Node.js
echo.
echo [3/5] Instalando dependências Node.js...
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências Node.js
        pause
        exit /b 1
    )
    echo ✅ Dependências Node.js instaladas
) else (
    echo ✅ Dependências Node.js já instaladas
)

:: Instalar dependências Python
echo.
echo [4/5] Instalando dependências Python...
echo 📦 Instalando ferramentas de qualidade Python...
python -m pip install flake8 black isort
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências Python
    pause
    exit /b 1
)
echo ✅ Dependências Python instaladas

:: Verificar qualidade do código
echo.
echo [5/5] Verificando qualidade do código...
echo 🔍 Executando linters...
npm run quality
if %errorlevel% neq 0 (
    echo ⚠️  Alguns problemas de qualidade encontrados
    echo Executando correções automáticas...
    npm run lint
    npm run format
) else (
    echo ✅ Código verificado com sucesso
)

echo.
echo ========================================
echo   🎉 CONFIGURAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo Iniciando sistema em terminais separados...
echo.

:: Abrir terminal para o backend
start "Sompo Backend" cmd /k "cd /d %~dp0 && title Sompo Backend && echo 🚀 Iniciando Backend... && npm run backend"

:: Aguardar um pouco para o backend inicializar
timeout /t 3 /nobreak >nul

:: Abrir terminal para o frontend
start "Sompo Frontend" cmd /k "cd /d %~dp0 && title Sompo Frontend && echo 🌐 Iniciando Frontend... && timeout /t 2 /nobreak >nul && npm run frontend"

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Pressione qualquer tecla para fechar este terminal...
pause >nul
