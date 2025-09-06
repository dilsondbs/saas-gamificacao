@echo off
echo ================================================
echo     BATERIA COMPLETA DE TESTES - SAAS GAMIFICACAO
echo ================================================
echo.

echo [1/4] Executando testes de compatibilidade...
echo Abrindo test_compatibility.html...
start "" "test_compatibility.html"
timeout /t 3 /nobreak >nul

echo.
echo [2/4] Executando testes de responsividade...
echo Abrindo responsive_test.html...
start "" "responsive_test.html"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Executando testes de performance...
if exist node.exe (
    node test_performance.js
) else (
    echo Node.js nao encontrado - instale Node.js para executar testes de performance
)

echo.
echo [4/4] Abrindo relatorios...
if exist performance_report.html (
    echo Abrindo performance_report.html...
    start "" "performance_report.html"
    timeout /t 2 /nobreak >nul
)

echo Abrindo COMPATIBILITY_REPORT.md...
start "" "COMPATIBILITY_REPORT.md"

echo.
echo ================================================
echo     TESTES CONCLUIDOS!
echo ================================================
echo.
echo Arquivos gerados:
echo - test_compatibility.html (teste interativo)
echo - responsive_test.html (simulador de dispositivos)
echo - performance_report.html (relatorio de performance)
echo - performance_report.json (dados de performance)
echo - COMPATIBILITY_REPORT.md (relatorio completo)
echo.
echo Verifique os navegadores abertos para executar os testes.
echo.
pause