@echo off
chcp 65001 >nul
title Sompo Monitoring System

echo.
echo ========================================
echo   SOMPO MONITORING SYSTEM
echo ========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js encontrado

:: Instalar dependencias se necessario
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

:: Compilar backend se necessario
pushd backend >nul
if not exist "dist" (
    echo Compilando backend...
    npm run build
)
popd >nul

echo.
echo Iniciando sistema...
echo.

:: Iniciar Backend
echo [1/2] Iniciando Backend...
start "Sompo Backend" cmd /k "cd /d %~dp0 && title Backend && npm run backend"

:: Aguardar
timeout /t 5 /nobreak >nul

:: Iniciar Frontend
echo [2/2] Iniciando Frontend...
start "Sompo Frontend" cmd /k "cd /d %~dp0 && title Frontend && npm run frontend"

:: Aguardar
timeout /t 3 /nobreak >nul

:: Abrir navegador
echo Abrindo navegador...
start http://localhost:3000

echo.
echo ========================================
echo Sistema iniciado com sucesso!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
