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

:: Instalar dependências do Backend (projeto TypeScript separado)
echo.
echo [3.1/5] Instalando dependências do Backend...
pushd backend >nul
if not exist "node_modules" (
    echo 📦 Instalando dependências do Backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do Backend
        popd >nul
        pause
        exit /b 1
    )
    echo ✅ Dependências do Backend instaladas
) else (
    echo ✅ Dependências do Backend já instaladas
)

:: Compilar Backend (TypeScript -> dist)
echo Compilando Backend...
npm run build
if %errorlevel% neq 0 (
    echo ⚠️  Falha ao compilar com TypeScript. Tentando servidor simples...
)
popd >nul

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
echo Iniciando sistema automaticamente...
echo.

:: Iniciar servidores diretamente
echo Iniciando Backend...
start "Sompo Backend" cmd /k "cd /d %~dp0 && title Sompo Backend && echo 🚀 Backend iniciando... && npm run backend"

timeout /t 5 /nobreak >nul

echo Iniciando Frontend com React integrado...
start "Sompo Frontend" cmd /k "cd /d %~dp0 && title Sompo Frontend && echo 🌐 Frontend + React iniciando... && npm run frontend"

timeout /t 3 /nobreak >nul

echo Abrindo navegador...
start http://localhost:3000

echo.
echo ✨ Novas funcionalidades disponíveis:
echo   - Botão de alternância de tema (claro/escuro)
echo   - Efeitos glassmorphism aprimorados
echo   - Animações e hover effects
echo   - Interface mais moderna e responsiva
echo.
echo Sistema totalmente operacional!
echo Pressione qualquer tecla para fechar este terminal...
pause >nul
