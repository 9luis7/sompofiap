@echo off
REM ====================================================
REM  SOMPO - Iniciar API Python de ML
REM ====================================================
echo.
echo ========================================
echo   SOMPO ML API - Inicializando
echo ========================================
echo.

echo [1/2] Verificando modelo treinado...
if not exist "backend\models\risk_model.joblib" (
    echo.
    echo X ERRO: Modelo nao encontrado!
    echo.
    echo Execute primeiro: python train_risk_model.py
    echo.
    pause
    exit /b 1
)

echo   OK Modelo encontrado: backend\models\risk_model.joblib
echo.

echo [2/2] Iniciando servidor Flask...
echo.
python ml_prediction_api.py

pause

