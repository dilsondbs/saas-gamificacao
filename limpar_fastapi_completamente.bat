@echo off
echo ========================================
echo   LIMPANDO TODOS OS PROCESSOS FASTAPI
echo ========================================
echo.

echo [IMPORTANTE] Matando TODOS os processos Python/Uvicorn...
echo.

REM Matar todos os processos uvicorn
taskkill /F /IM uvicorn.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Processos uvicorn encerrados
) else (
    echo ℹ️  Nenhum processo uvicorn encontrado
)

REM Matar todos os processos python
echo.
echo Matando processos Python que estão na pasta eduai-ai-service...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /NH') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Aguardando 3 segundos para garantir que tudo foi encerrado...
timeout /t 3 /nobreak >nul

REM Verificar se porta 8001 está livre
echo.
echo Verificando porta 8001...
netstat -ano | findstr :8001 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo.
    echo ⚠️  AVISO: Ainda há processos na porta 8001
    echo.
    echo Matando manualmente...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001 ^| findstr LISTENING') do (
        echo Matando PID: %%a
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo ========================================
echo   ✅ LIMPEZA CONCLUÍDA!
echo ========================================
echo.
echo A porta 8001 está livre.
echo.
echo PRÓXIMO PASSO:
echo Dê dois cliques em: iniciar_fastapi_limpo.bat
echo.
pause
