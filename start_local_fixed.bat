@echo off
echo ================================================
echo 🚀 Sompo IA - Iniciando Projeto Local (Corrigido)
echo ================================================

REM Verifica se o ambiente conda existe
if not exist "C:\ProgramData\anaconda3\envs\sompo" (
    echo ❌ Ambiente conda 'sompo' não encontrado.
    echo Execute primeiro: conda create -n sompo python=3.9 -y
    pause
    exit /b 1
)
echo ✅ Ambiente conda encontrado

echo.
echo 🔧 Iniciando backend...
start "Backend" cmd /k "cd backend && C:\ProgramData\anaconda3\envs\sompo\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Iniciando frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ===============================================
echo 🎉 PROJETO INICIADO COM SUCESSO!
echo ===============================================
echo 📊 Dashboard: http://localhost:3000
echo 🔧 API Docs: http://localhost:8000/docs
echo 🏥 Health Check: http://localhost:8000/health
echo.
echo 💡 Os serviços estão rodando em janelas separadas
echo 💡 Para parar, feche as janelas dos terminais
echo.
pause
