#!/bin/bash

# 🚀 Script de Deploy Automático - SaaS Gamificação
# Uso: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_DIR="/var/www/saas-gamificacao"
BACKUP_DIR="/var/backups/saas-gamificacao"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

# Verificar se está rodando como usuário correto
if [ "$EUID" -eq 0 ]; then 
    error "Não execute este script como root!"
fi

log "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

# Verificar se o diretório do projeto existe
if [ ! -d "$PROJECT_DIR" ]; then
    error "Diretório do projeto não encontrado: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 1. Ativar modo de manutenção
log "🔒 Ativando modo de manutenção..."
php artisan down --refresh=15 --secret="deploy-$(date +%s)"

# Função para reverter em caso de erro
cleanup() {
    log "🔄 Revertendo modo de manutenção devido a erro..."
    php artisan up
}
trap cleanup ERR

# 2. Criar backup do banco de dados
log "📦 Criando backup do banco de dados..."
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME=$(php artisan tinker --execute="echo config('database.connections.central.database');")

if [ "$ENVIRONMENT" = "production" ]; then
    mysqldump -u $(php artisan tinker --execute="echo config('database.connections.central.username');") \
              -p$(php artisan tinker --execute="echo config('database.connections.central.password');") \
              "$DB_NAME" > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"
    log "📦 Backup salvo em: $BACKUP_DIR/backup_${TIMESTAMP}.sql"
else
    warn "Pulando backup em ambiente staging"
fi

# 3. Pull das últimas alterações
log "📥 Atualizando código fonte..."
git fetch origin
git reset --hard origin/$(git branch --show-current)

# 4. Verificar se há mudanças no composer.json
if git diff --name-only HEAD~1 HEAD | grep -q "composer.json\|composer.lock"; then
    log "📦 Atualizando dependências PHP..."
    composer install --optimize-autoloader --no-dev --no-interaction
else
    log "⏭️ Sem mudanças em dependências PHP"
fi

# 5. Verificar se há mudanças no package.json
if git diff --name-only HEAD~1 HEAD | grep -q "package.json\|package-lock.json"; then
    log "📦 Atualizando dependências Node.js..."
    npm ci
else
    log "⏭️ Sem mudanças em dependências Node.js"
fi

# 6. Verificar se há mudanças nos assets
if git diff --name-only HEAD~1 HEAD | grep -q "resources/\|vite.config.js\|tailwind.config.js"; then
    log "🔨 Compilando assets..."
    npm run build
else
    log "⏭️ Sem mudanças nos assets"
fi

# 7. Configurar ambiente
log "⚙️ Configurando ambiente..."
if [ -f ".env.$ENVIRONMENT" ]; then
    cp ".env.$ENVIRONMENT" .env
    log "✅ Arquivo .env atualizado para $ENVIRONMENT"
else
    warn "Arquivo .env.$ENVIRONMENT não encontrado, mantendo .env atual"
fi

# 8. Limpar caches antes das migrações
log "🧹 Limpando caches antigos..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# 9. Executar migrações
if git diff --name-only HEAD~1 HEAD | grep -q "database/migrations/"; then
    log "🗄️ Executando migrações do banco de dados..."
    php artisan migrate --force
    
    # Verificar se há migrações para tenants
    log "🏢 Executando migrações dos tenants..."
    php artisan tenants:migrate --force
else
    log "⏭️ Sem novas migrações"
fi

# 10. Recriar caches otimizados
log "⚡ Criando caches otimizados..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 11. Otimizar autoloader
log "🔧 Otimizando autoloader..."
composer dump-autoload --optimize

# 12. Criar links simbólicos se necessário
if [ ! -L "public/storage" ]; then
    log "🔗 Criando link simbólico para storage..."
    php artisan storage:link
fi

# 13. Reiniciar workers de queue (se existirem)
if pgrep -f "queue:work" > /dev/null; then
    log "🔄 Reiniciando workers de queue..."
    php artisan queue:restart
fi

# 14. Executar seeders específicos se necessário
if [ "$ENVIRONMENT" = "staging" ]; then
    log "🌱 Executando seeders de staging..."
    php artisan db:seed --class=BadgeSeeder --force
fi

# 15. Verificar saúde da aplicação
log "🏥 Verificando saúde da aplicação..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/health" || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
    warn "Health check falhou (HTTP $HTTP_CODE), mas continuando..."
fi

# 16. Desativar modo de manutenção
log "🔓 Desativando modo de manutenção..."
php artisan up

# 17. Limpar logs antigos (manter apenas últimos 7 dias)
log "📝 Limpando logs antigos..."
find storage/logs -name "*.log" -type f -mtime +7 -delete

# 18. Verificações pós-deploy
log "✅ Executando verificações pós-deploy..."

# Verificar se a aplicação está respondendo
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    log "✅ Aplicação respondendo normalmente"
else
    error "❌ Aplicação não está respondendo (HTTP $HTTP_CODE)"
fi

# Verificar conexão com banco de dados
php artisan tinker --execute="
try {
    DB::connection('central')->getPdo();
    echo 'Database connection: OK';
} catch (Exception \$e) {
    echo 'Database connection: FAILED - ' . \$e->getMessage();
    exit(1);
}
" || error "❌ Falha na conexão com banco de dados"

log "🎉 Deploy concluído com sucesso!"
log "🕐 Timestamp: $TIMESTAMP"
log "🌐 Ambiente: $ENVIRONMENT"
log "📊 Hash do commit: $(git rev-parse --short HEAD)"

# Notificação opcional (descomente se usar Slack/Discord)
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"🚀 Deploy realizado com sucesso no ambiente '$ENVIRONMENT'"}' \
#     $SLACK_WEBHOOK_URL

log "🔗 Para verificar: http://your-domain.com"
log "📋 Para monitorar logs: tail -f storage/logs/laravel.log"