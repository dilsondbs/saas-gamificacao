@echo off
echo ========================================
echo   INICIANDO FASTAPI (VERSÃO LIMPA)
echo ========================================
echo.

REM Verificar se porta 8001 está livre
netstat -ano | findstr :8001 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo ❌ ERRO: Porta 8001 ainda está em uso!
    echo.
    echo Execute primeiro: limpar_fastapi_completamente.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Porta 8001 está livre
echo.

REM Ir para pasta do FastAPI
cd eduai-ai-service

REM Verificar se .env existe
if not exist ".env" (
    echo ❌ ERRO: Arquivo .env não encontrado!
    echo.
    pause
    exit /b 1
)

echo ✅ Arquivo .env encontrado
echo.

echo ========================================
echo   INICIANDO FASTAPI COM CÓDIGO ATUALIZADO
echo ========================================
echo.
echo ⏳ Aguarde alguns segundos...
echo.
echo IMPORTANTE:
echo 1. NÃO FECHE ESTA JANELA!
echo 2. Aguarde ver: "Application startup complete."
echo 3. Depois teste no navegador
echo.
echo ========================================
echo.

REM Iniciar FastAPI
python -m uvicorn app.main:app --reload --port 8001

pause
