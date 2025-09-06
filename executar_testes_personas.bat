@echo off
title Testes de Personas - SaaS Gamificacao
color 0A

echo ===============================================
echo    ROTEIRO DE TESTES POR PERSONAS
echo    SaaS Gamificacao - Versao 1.0.0
echo ===============================================
echo.

:MENU
echo Selecione o teste que deseja executar:
echo.
echo [1] Setup Inicial - Preparar Ambiente
echo [2] Teste Persona: Super Admin (Central)
echo [3] Teste Persona: Instructor/Admin (Tenant)
echo [4] Teste Persona: Student (Aluno)
echo [5] Executar Todos os Testes Sequenciais
echo [6] Abrir Documentacao Completa
echo [0] Sair
echo.
set /p escolha="Digite sua opcao: "

if "%escolha%"=="1" goto SETUP
if "%escolha%"=="2" goto ADMIN
if "%escolha%"=="3" goto INSTRUCTOR
if "%escolha%"=="4" goto STUDENT
if "%escolha%"=="5" goto TODOS
if "%escolha%"=="6" goto DOCS
if "%escolha%"=="0" goto FIM
goto MENU

:SETUP
echo.
echo [SETUP] Preparando ambiente de testes...
echo ==========================================
echo.
echo 1. Iniciando servidor Laravel...
start /min cmd /c "php artisan serve --host=127.0.0.1 --port=8080"
timeout /t 3 /nobreak >nul

echo 2. Verificando banco de dados...
php artisan migrate:status

echo.
echo 3. Preparando dados de teste...
php artisan setup_e2e_test.php

echo.
echo 4. URLs de acesso:
echo    Central: http://127.0.0.1:8080
echo    Tenant:  http://escola-exemplo.saas-gamificacao.local:8080
echo.
echo Setup concluido! Pressione qualquer tecla para voltar ao menu.
pause >nul
goto MENU

:ADMIN
echo.
echo [PERSONA: SUPER ADMIN] Iniciando teste...
echo ==========================================
echo.
echo Credenciais:
echo   Email: admin@saas-gamificacao.com
echo   Senha: admin123
echo.
echo Abrindo navegador para central...
start "" "http://127.0.0.1:8080"
echo.
echo Checklist de teste:
echo [ ] 1. Login no sistema central
echo [ ] 2. Visualizar dashboard central
echo [ ] 3. Criar novo tenant "Escola Exemplo"
echo [ ] 4. Configurar limites e planos
echo [ ] 5. Fazer impersonation para acessar tenant
echo.
echo Abrindo roteiro completo...
start "" "ROTEIRO_TESTE_PERSONAS.md"
echo.
echo Pressione qualquer tecla apos completar o teste.
pause >nul
goto MENU

:INSTRUCTOR
echo.
echo [PERSONA: INSTRUCTOR] Iniciando teste...
echo =========================================
echo.
echo Credenciais:
echo   Email: admin@escola-exemplo.com
echo   Senha: admin123
echo.
echo Abrindo navegador para tenant...
start "" "http://escola-exemplo.saas-gamificacao.local:8080"
echo.
echo Checklist de teste:
echo [ ] 1. Login no tenant
echo [ ] 2. Criar usuarios (professores e alunos)
echo [ ] 3. Configurar sistema de badges
echo [ ] 4. Criar curso completo
echo [ ] 5. Adicionar materiais e atividades
echo [ ] 6. Publicar curso
echo.
echo Abrindo roteiro completo...
start "" "ROTEIRO_TESTE_PERSONAS.md"
echo.
echo Pressione qualquer tecla apos completar o teste.
pause >nul
goto MENU

:STUDENT
echo.
echo [PERSONA: STUDENT] Iniciando teste...
echo =====================================
echo.
echo Credenciais:
echo   Email: ana@escola-exemplo.com
echo   Senha: aluno123
echo.
echo Abrindo navegador para tenant...
start "" "http://escola-exemplo.saas-gamificacao.local:8080"
echo.
echo Checklist de teste:
echo [ ] 1. Login como aluno
echo [ ] 2. Descobrir e matricular-se no curso
echo [ ] 3. Explorar materiais
echo [ ] 4. Completar atividades sequencialmente
echo [ ] 5. Acompanhar progresso e badges
echo [ ] 6. Verificar leaderboard
echo.
echo Abrindo roteiro completo...
start "" "ROTEIRO_TESTE_PERSONAS.md"
echo.
echo Pressione qualquer tecla apos completar o teste.
pause >nul
goto MENU

:TODOS
echo.
echo [TODOS OS TESTES] Executando sequencia completa...
echo ==================================================
echo.
echo Este processo ira:
echo 1. Executar setup inicial
echo 2. Abrir todas as URLs necessarias
echo 3. Mostrar documentacao de cada persona
echo.
set /p continuar="Deseja continuar? (s/n): "
if /i not "%continuar%"=="s" goto MENU

echo.
echo Executando setup...
call :SETUP_SILENT

echo.
echo Abrindo URLs para cada persona...
start "" "http://127.0.0.1:8080"
timeout /t 2 /nobreak >nul
start "" "http://escola-exemplo.saas-gamificacao.local:8080"

echo.
echo Abrindo documentacao...
start "" "ROTEIRO_TESTE_PERSONAS.md"

echo.
echo Todos os testes iniciados! Siga o roteiro na documentacao.
pause >nul
goto MENU

:SETUP_SILENT
echo Iniciando servidor...
start /min cmd /c "php artisan serve --host=127.0.0.1 --port=8080"
timeout /t 3 /nobreak >nul
php -f setup_e2e_test.php
goto :eof

:DOCS
echo.
echo Abrindo documentacao completa...
start "" "ROTEIRO_TESTE_PERSONAS.md"
start "" "COMPATIBILITY_REPORT.md"
start "" "DEPLOY.md"
goto MENU

:FIM
echo.
echo Encerrando testes. Obrigado!
echo.
echo Para parar o servidor Laravel:
echo   Ctrl+C na janela do servidor ou feche a janela
echo.
pause
exit

:ERROR
echo.
echo ERRO: Comando nao reconhecido. Tente novamente.
pause >nul
goto MENU