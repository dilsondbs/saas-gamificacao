@echo off
echo ========================================
echo   REINICIANDO APACHE
echo ========================================
echo.

echo Parando Apache...
net stop Apache2.4

echo.
echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo Iniciando Apache...
net start Apache2.4

echo.
echo ========================================
echo   APACHE REINICIADO!
echo ========================================
echo.
echo Agora teste novamente na interface web.
echo.
pause
