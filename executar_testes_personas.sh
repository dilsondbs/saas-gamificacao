#!/bin/bash

# Testes de Personas - SaaS Gamificação
# Versão 1.0.0

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir header
show_header() {
    clear
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}    ROTEIRO DE TESTES POR PERSONAS${NC}"
    echo -e "${GREEN}    SaaS Gamificação - Versão 1.0.0${NC}"  
    echo -e "${GREEN}===============================================${NC}"
    echo ""
}

# Função para setup inicial
setup_inicial() {
    echo -e "${BLUE}[SETUP] Preparando ambiente de testes...${NC}"
    echo "=========================================="
    echo ""
    
    echo "1. Iniciando servidor Laravel..."
    php artisan serve --host=127.0.0.1 --port=8080 &
    SERVER_PID=$!
    echo "Servidor iniciado com PID: $SERVER_PID"
    sleep 3
    
    echo ""
    echo "2. Verificando banco de dados..."
    php artisan migrate:status
    
    echo ""
    echo "3. Preparando dados de teste..."
    php setup_e2e_test.php
    
    echo ""
    echo "4. URLs de acesso:"
    echo "   Central: http://127.0.0.1:8080"
    echo "   Tenant:  http://escola-exemplo.saas-gamificacao.local:8080"
    echo ""
    echo -e "${GREEN}Setup concluído!${NC}"
}

# Função para teste persona admin
teste_admin() {
    echo -e "${BLUE}[PERSONA: SUPER ADMIN] Iniciando teste...${NC}"
    echo "=========================================="
    echo ""
    echo "Credenciais:"
    echo "  Email: admin@saas-gamificacao.com"
    echo "  Senha: admin123"
    echo ""
    
    # Tentar abrir navegador (funciona no Linux com GUI)
    if command -v xdg-open > /dev/null; then
        echo "Abrindo navegador para central..."
        xdg-open "http://127.0.0.1:8080"
    elif command -v open > /dev/null; then
        echo "Abrindo navegador para central..."
        open "http://127.0.0.1:8080"
    else
        echo "Acesse manualmente: http://127.0.0.1:8080"
    fi
    
    echo ""
    echo "Checklist de teste:"
    echo "[ ] 1. Login no sistema central"
    echo "[ ] 2. Visualizar dashboard central"
    echo "[ ] 3. Criar novo tenant 'Escola Exemplo'"
    echo "[ ] 4. Configurar limites e planos"
    echo "[ ] 5. Fazer impersonation para acessar tenant"
    echo ""
}

# Função para teste persona instructor
teste_instructor() {
    echo -e "${BLUE}[PERSONA: INSTRUCTOR] Iniciando teste...${NC}"
    echo "========================================="
    echo ""
    echo "Credenciais:"
    echo "  Email: admin@escola-exemplo.com"
    echo "  Senha: admin123"
    echo ""
    
    if command -v xdg-open > /dev/null; then
        echo "Abrindo navegador para tenant..."
        xdg-open "http://escola-exemplo.saas-gamificacao.local:8080"
    elif command -v open > /dev/null; then
        echo "Abrindo navegador para tenant..."
        open "http://escola-exemplo.saas-gamificacao.local:8080"
    else
        echo "Acesse manualmente: http://escola-exemplo.saas-gamificacao.local:8080"
    fi
    
    echo ""
    echo "Checklist de teste:"
    echo "[ ] 1. Login no tenant"
    echo "[ ] 2. Criar usuários (professores e alunos)"
    echo "[ ] 3. Configurar sistema de badges"
    echo "[ ] 4. Criar curso completo"
    echo "[ ] 5. Adicionar materiais e atividades"
    echo "[ ] 6. Publicar curso"
    echo ""
}

# Função para teste persona student
teste_student() {
    echo -e "${BLUE}[PERSONA: STUDENT] Iniciando teste...${NC}"
    echo "====================================="
    echo ""
    echo "Credenciais:"
    echo "  Email: ana@escola-exemplo.com"
    echo "  Senha: aluno123"
    echo ""
    
    if command -v xdg-open > /dev/null; then
        echo "Abrindo navegador para tenant..."
        xdg-open "http://escola-exemplo.saas-gamificacao.local:8080"
    elif command -v open > /dev/null; then
        echo "Abrindo navegador para tenant..."
        open "http://escola-exemplo.saas-gamificacao.local:8080"
    else
        echo "Acesse manualmente: http://escola-exemplo.saas-gamificacao.local:8080"
    fi
    
    echo ""
    echo "Checklist de teste:"
    echo "[ ] 1. Login como aluno"
    echo "[ ] 2. Descobrir e matricular-se no curso"
    echo "[ ] 3. Explorar materiais"
    echo "[ ] 4. Completar atividades sequencialmente"
    echo "[ ] 5. Acompanhar progresso e badges"
    echo "[ ] 6. Verificar leaderboard"
    echo ""
}

# Função para executar todos os testes
todos_testes() {
    echo -e "${BLUE}[TODOS OS TESTES] Executando sequência completa...${NC}"
    echo "=================================================="
    echo ""
    echo "Este processo irá:"
    echo "1. Executar setup inicial"
    echo "2. Abrir todas as URLs necessárias"
    echo "3. Mostrar documentação de cada persona"
    echo ""
    
    read -p "Deseja continuar? (s/n): " continuar
    if [[ $continuar != "s" && $continuar != "S" ]]; then
        return
    fi
    
    echo ""
    echo "Executando setup..."
    setup_inicial
    
    echo ""
    echo "Abrindo URLs para cada persona..."
    if command -v xdg-open > /dev/null; then
        xdg-open "http://127.0.0.1:8080"
        sleep 2
        xdg-open "http://escola-exemplo.saas-gamificacao.local:8080"
    elif command -v open > /dev/null; then
        open "http://127.0.0.1:8080"
        sleep 2
        open "http://escola-exemplo.saas-gamificacao.local:8080"
    fi
    
    echo ""
    echo -e "${GREEN}Todos os testes iniciados! Siga o roteiro na documentação.${NC}"
}

# Função para abrir documentação
abrir_docs() {
    echo "Abrindo documentação completa..."
    
    if command -v xdg-open > /dev/null; then
        xdg-open "ROTEIRO_TESTE_PERSONAS.md"
        xdg-open "COMPATIBILITY_REPORT.md"
        xdg-open "DEPLOY.md"
    elif command -v open > /dev/null; then
        open "ROTEIRO_TESTE_PERSONAS.md"
        open "COMPATIBILITY_REPORT.md"
        open "DEPLOY.md"
    else
        echo "Abra manualmente os arquivos:"
        echo "- ROTEIRO_TESTE_PERSONAS.md"
        echo "- COMPATIBILITY_REPORT.md"
        echo "- DEPLOY.md"
    fi
}

# Menu principal
main_menu() {
    while true; do
        show_header
        echo "Selecione o teste que deseja executar:"
        echo ""
        echo "1) Setup Inicial - Preparar Ambiente"
        echo "2) Teste Persona: Super Admin (Central)"
        echo "3) Teste Persona: Instructor/Admin (Tenant)"
        echo "4) Teste Persona: Student (Aluno)"
        echo "5) Executar Todos os Testes Sequenciais"
        echo "6) Abrir Documentação Completa"
        echo "0) Sair"
        echo ""
        
        read -p "Digite sua opção: " escolha
        
        case $escolha in
            1)
                show_header
                setup_inicial
                read -p "Pressione ENTER para continuar..."
                ;;
            2)
                show_header
                teste_admin
                abrir_docs
                read -p "Pressione ENTER após completar o teste..."
                ;;
            3)
                show_header
                teste_instructor
                abrir_docs
                read -p "Pressione ENTER após completar o teste..."
                ;;
            4)
                show_header
                teste_student
                abrir_docs
                read -p "Pressione ENTER após completar o teste..."
                ;;
            5)
                show_header
                todos_testes
                read -p "Pressione ENTER para continuar..."
                ;;
            6)
                show_header
                abrir_docs
                read -p "Pressione ENTER para continuar..."
                ;;
            0)
                echo ""
                echo "Encerrando testes. Obrigado!"
                echo ""
                echo "Para parar o servidor Laravel:"
                echo "  Pressione Ctrl+C na janela do servidor"
                echo ""
                if [ ! -z "$SERVER_PID" ]; then
                    echo "Parando servidor (PID: $SERVER_PID)..."
                    kill $SERVER_PID 2>/dev/null
                fi
                exit 0
                ;;
            *)
                echo -e "${RED}ERRO: Opção inválida. Tente novamente.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Verificar se o arquivo existe no diretório correto
if [ ! -f "artisan" ]; then
    echo -e "${RED}ERRO: Execute este script a partir do diretório raiz do Laravel!${NC}"
    exit 1
fi

# Tornar script executável
chmod +x "$0"

# Iniciar menu principal
main_menu