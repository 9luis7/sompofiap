@echo off
echo ========================================
echo  SOMPO - Importacao de Dados DATATRAN
echo ========================================
echo.

echo [1/3] Verificando dependencias...
cd backend
if not exist node_modules (
    echo Instalando dependencias do backend...
    call npm install
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/3] Verificando banco de dados...
echo Execute a migration manualmente se ainda nao executou:
echo   psql -U postgres -d sompo_monitoring -f ../database/migrations/002_historical_accidents.sql
echo.
pause

echo.
echo [3/3] Iniciando importacao de dados...
echo.
call npm run import-datatran

echo.
echo ========================================
echo  Importacao concluida!
echo ========================================
echo.
echo Proximos passos:
echo 1. Gerar zonas de risco via API: POST /api/v1/risks/generate-zones
echo 2. Iniciar o sistema: start.bat
echo.
pause

