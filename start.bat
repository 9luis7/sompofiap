@echo off
chcp 65001 >nul
title Sompo Monitoring System

echo.
echo ═══════════════════════════════════════════════════════
echo    🚀 SISTEMA SOMPO - Iniciando...
echo ═══════════════════════════════════════════════════════
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo    Instale em: https://nodejs.org/
    pause
    exit /b 1
)
node --version

:: Instalar dependências root (se necessário)
echo.
echo [2/4] Verificando dependências root...
if not exist "node_modules" (
    echo 📦 Instalando...
    npm install
)

:: Instalar dependências backend
echo.
echo [3/4] Verificando dependências backend...
cd backend
if not exist "node_modules" (
    echo 📦 Instalando...
    npm install
)

:: Build backend
echo.
echo [4/4] Compilando backend...
if not exist "dist" (
    npm run build
) else (
    echo ✅ Backend já compilado
)

:: Voltar para raiz
cd ..

echo.
echo ═══════════════════════════════════════════════════════
echo    ✅ INICIANDO SISTEMA
echo ═══════════════════════════════════════════════════════
echo.
echo 🔧 Backend:  http://localhost:3001
echo 🌐 Frontend: http://localhost:8080
echo.
echo 👤 Login: admin.sompo / password123
echo.

:: Iniciar backend em terminal separado
start "Sompo Backend API" cmd /k "cd /d %~dp0backend && echo 🚀 Backend API rodando... && node dist/server.js"

:: Aguardar backend inicializar
timeout /t 5 /nobreak >nul

:: Iniciar frontend (com cache desabilitado para desenvolvimento)
start "Sompo Frontend" cmd /k "cd /d %~dp0 && echo 🌐 Frontend servido em http://localhost:8080 && npx http-server frontend -p 8080 -c-1 -o"

echo.
echo ✅ Sistema iniciado!
echo.
echo 📖 Documentação: README.md
echo.
pause
