@echo off
echo ========================================
echo   TESTE COMPARATIVO OPENAI vs GEMINI
echo ========================================
echo.

echo Verificando se FastAPI esta rodando...
curl -s http://localhost:8001/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERRO] FastAPI nao esta rodando!
    echo.
    echo Execute primeiro: reiniciar_fastapi.bat
    echo.
    pause
    exit /b 1
)

echo [OK] FastAPI esta rodando!
echo.
echo Iniciando teste comparativo...
echo.
echo ========================================
echo.

php test_openai_vs_gemini.php

echo.
pause
