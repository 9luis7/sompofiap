@echo off
echo ================================================
echo   API de Classificacao de Acidentes - Sompo
echo ================================================
echo.

cd %~dp0\..

echo Ativando ambiente Python...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo Ambiente virtual nao encontrado. Usando Python global...
)

echo.
echo Iniciando API de Classificacao (porta 5001)...
echo.

python scripts\classification_api.py

pause

