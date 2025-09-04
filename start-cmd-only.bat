@echo off
setlocal ENABLEEXTENSIONS
title Sompo Monitoring - CMD Launcher
cd /d %~dp0

echo.
echo ========================================
echo   SOMPO MONITORING - CMD LAUNCHER
echo ========================================
echo.

:: Garantir Node no PATH
where node >nul 2>&1 || (
  echo Node.js nao encontrado. Instale em https://nodejs.org/
  pause
  exit /b 1
)

:: Compilar backend se necessario
if not exist "backend\dist\server.js" (
  echo Compilando backend (primeira vez)...
  pushd backend >nul
  call npm run build
  if %errorlevel% neq 0 (
    echo Falha ao compilar com TypeScript. Continuando.
  )
  popd >nul
)

:: Abrir janela do Backend (CMD)
start "Sompo Backend" cmd /k "cd /d %~dp0 && title Sompo Backend && npm run backend"

:: Pequeno atraso
timeout /t 2 /nobreak >nul

:: Abrir janela do Frontend (CMD)
start "Sompo Frontend" cmd /k "cd /d %~dp0 && title Sompo Frontend && npm run frontend"

echo.
echo Janelas abertas. Caso nao aparecam, verifique bloqueio de janelas pelo Windows.
echo.
exit /b 0


