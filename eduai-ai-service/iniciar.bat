@echo off
echo ============================================
echo   EDUAI - MICROSERVICO PYTHON AI
echo ============================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Por favor, instale Python 3.11 ou superior:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANTE: Marque a opcao "Add Python to PATH"
    pause
    exit /b 1
)

echo [OK] Python encontrado
python --version
echo.

REM Verificar se .env existe
if not exist ".env" (
    echo [AVISO] Arquivo .env nao encontrado!
    echo.
    echo Criando .env a partir do .env.example...
    copy .env.example .env >nul
    echo.
    echo [IMPORTANTE] Edite o arquivo .env e adicione sua chave OpenAI
    echo.
    echo Abra: .env
    echo Procure: OPENAI_API_KEY=your_openai_api_key_here
    echo Substitua pela sua chave da OpenAI
    echo.
    notepad .env
    echo.
    echo Salvou a chave? Pressione qualquer tecla para continuar...
    pause >nul
)

echo [OK] Arquivo .env encontrado
echo.

REM Verificar se as dependencias estao instaladas
echo Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo [INSTALANDO] Bibliotecas Python...
    echo Isso pode demorar alguns minutos...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

echo [OK] Dependencias instaladas
echo.

echo ============================================
echo   INICIANDO MICROSERVICO...
echo ============================================
echo.
echo O microservico vai iniciar em alguns segundos...
echo.
echo IMPORTANTE:
echo - NAO FECHE ESTA JANELA
echo - Acesse: http://localhost:8001/docs
echo - Para parar: Pressione CTRL+C
echo.
echo ============================================
echo.

uvicorn app.main:app --reload --port 8001

pause
