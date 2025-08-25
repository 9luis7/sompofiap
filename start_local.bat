@echo off
echo 🎯 Sompo IA - Iniciando Projeto Local
echo ================================================

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado. Instale Python 3.8+ primeiro.
    pause
    exit /b 1
)
echo ✅ Python encontrado

REM Verifica se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js 16+ primeiro.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 🔧 Instalando dependências do backend...
pip install -r backend/requirements.txt
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do backend
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas!

echo.
echo 🔧 Instalando dependências do frontend...
cd frontend
npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)
cd ..
echo ✅ Dependências do frontend instaladas!

echo.
echo 🚀 Iniciando backend...
start "Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

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
