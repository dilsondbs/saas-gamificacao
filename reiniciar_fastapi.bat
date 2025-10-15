@echo off
echo ========================================
echo   REINICIANDO FASTAPI
echo ========================================
echo.

echo [1/3] Parando processos na porta 8001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001') do (
    echo Matando processo: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo.

echo [2/3] Aguardando 3 segundos...
timeout /t 3 /nobreak >nul
echo.

echo [3/3] Iniciando FastAPI novamente...
echo.
echo IMPORTANTE: Uma nova janela vai abrir
echo NAO FECHE ESSA NOVA JANELA!
echo.

cd eduai-ai-service
start cmd /k "iniciar.bat"

echo.
echo ========================================
echo   FASTAPI REINICIADO!
echo ========================================
echo.
echo Aguarde 5-10 segundos para o FastAPI iniciar completamente.
echo Voce pode fechar ESTA janela.
echo.
pause
