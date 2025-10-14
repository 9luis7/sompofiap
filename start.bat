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
echo 🔧 Backend + ML API: http://localhost:3001
echo 🌐 Frontend:         http://localhost:8080
echo 🤖 ML Python API:    http://localhost:5000 (gerenciado automaticamente)
echo.
echo 👤 Login: admin.sompo / password123
echo.
echo ⚡ O Backend irá iniciar automaticamente a API Python de ML
echo    Aguarde até ver "✅ SISTEMA SOMPO - OPERACIONAL"
echo.

:: Iniciar backend em terminal separado (ele gerencia o ML)
start "Sompo Backend + ML API" cmd /k "cd /d %~dp0backend && echo 🚀 Iniciando Backend (com ML integrado)... && node dist/server.js"

:: Aguardar backend e ML inicializarem
echo Aguardando inicialização completa...
timeout /t 10 /nobreak >nul

:: Iniciar frontend (com cache desabilitado para desenvolvimento)
start "Sompo Frontend" cmd /k "cd /d %~dp0 && echo 🌐 Frontend servido em http://localhost:8080 && npx http-server frontend -p 8080 -c-1 -o"

echo.
echo ✅ Sistema iniciado!
echo.
echo 💡 Dica: O Motor de ML agora inicia automaticamente com o backend
echo    Não é mais necessário executar start_ml_api.bat separadamente
echo.
echo 📖 Documentação: README.md
echo.
pause
