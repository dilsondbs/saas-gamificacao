@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║      🧪 TESTE AUTOMATIZADO - EduAI AI Service 🧪            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Python está instalado
python --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo.
    echo Por favor, instale Python 3.11+ de:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python encontrado
python --version
echo.

REM Verificar se estamos na pasta correta
if not exist "app\main.py" (
    echo ❌ Erro: Execute este script na pasta eduai-ai-service
    echo.
    pause
    exit /b 1
)

REM Instalar reportlab se necessário (para criar PDF de teste)
echo 📦 Verificando dependências extras...
pip show reportlab > nul 2>&1
if errorlevel 1 (
    echo    Instalando reportlab para criar PDF de teste...
    pip install reportlab > nul 2>&1
    if errorlevel 1 (
        echo    ⚠️  Não foi possível instalar reportlab (não é crítico)
    ) else (
        echo    ✅ reportlab instalado
    )
) else (
    echo    ✅ reportlab já instalado
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  EXECUTANDO TESTES...
echo ════════════════════════════════════════════════════════════════
echo.

REM Executar script de teste
python test_integration.py

REM Capturar código de saída
set EXIT_CODE=%errorlevel%

echo.
echo ════════════════════════════════════════════════════════════════
echo  TESTES CONCLUÍDOS!
echo ════════════════════════════════════════════════════════════════
echo.

if %EXIT_CODE%==0 (
    echo ✅ Todos os testes passaram!
    echo.
    echo 📋 PRÓXIMOS PASSOS:
    echo    1. Revise o arquivo: test_course_result.json
    echo    2. Teste na interface web do Laravel
    echo    3. Compare com geração via Gemini direto
    echo.
) else if %EXIT_CODE%==1 (
    echo ⚠️  Alguns testes falharam
    echo.
    echo 📋 RECOMENDAÇÕES:
    echo    1. Verifique os logs acima
    echo    2. Certifique-se que o microserviço está rodando
    echo    3. Verifique as API keys no .env
    echo.
) else (
    echo ❌ Vários testes falharam
    echo.
    echo 📋 AÇÕES NECESSÁRIAS:
    echo    1. Verifique se o microserviço está rodando: uvicorn app.main:app --reload --port 8001
    echo    2. Verifique o arquivo .env
    echo    3. Execute: python test_integration.py (para ver detalhes)
    echo.
)

pause
