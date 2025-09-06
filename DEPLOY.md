# 🚀 Guia de Deploy - SaaS Gamificação

## 📋 Requisitos do Servidor

### Versões de Software Requeridas

```bash
PHP >= 8.0.2
MySQL >= 8.0
Node.js >= 16.x
NPM >= 8.x
Composer >= 2.0
Redis >= 6.2 (recomendado para cache e sessões)
```

### Extensões PHP Obrigatórias

```bash
BCMath PHP Extension
Ctype PHP Extension
cURL PHP Extension
DOM PHP Extension
Fileinfo PHP Extension
JSON PHP Extension
Mbstring PHP Extension
OpenSSL PHP Extension
PCRE PHP Extension
PDO PHP Extension
PDO MySQL Driver
Tokenizer PHP Extension
XML PHP Extension
GD PHP Extension (para manipulação de imagens)
Redis PHP Extension (se usar Redis)
```

### Verificar Extensões PHP
```bash
php -m | grep -E "(bcmath|ctype|curl|dom|fileinfo|json|mbstring|openssl|pcre|pdo|pdo_mysql|tokenizer|xml|gd|redis)"
```

## 🔧 Configuração do Servidor Web

### Nginx (Recomendado)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com *.your-domain.com;
    root /var/www/saas-gamificacao/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    # Handle subdomain routing for multi-tenancy
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## 🗄️ Configuração do Banco de Dados

### MySQL 8.0+ Setup

```sql
-- Criar usuário para aplicação
CREATE USER 'saas_user'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER 'saas_tenant_user'@'localhost' IDENTIFIED BY 'secure_tenant_password';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON saas_gamificacao_central_staging.* TO 'saas_user'@'localhost';
GRANT ALL PRIVILEGES ON `tenant%`.* TO 'saas_tenant_user'@'localhost';

-- Criar database central
CREATE DATABASE saas_gamificacao_central_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recarregar privilégios
FLUSH PRIVILEGES;
```

### Configuração de Performance MySQL

```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 200
query_cache_size = 32M
query_cache_type = 1
innodb_log_file_size = 64M
```

## 📦 Processo de Deploy

### 1. Clone e Setup Inicial

```bash
# Clone do repositório
git clone https://github.com/your-repo/saas-gamificacao.git
cd saas-gamificacao

# Instalar dependências PHP (produção)
composer install --optimize-autoloader --no-dev

# Instalar dependências Node.js
npm ci

# Compilar assets para produção
npm run build

# Copiar arquivo de ambiente
cp .env.staging .env

# Gerar chave da aplicação
php artisan key:generate
```

### 2. Configuração do Ambiente

```bash
# Editar arquivo .env com credenciais reais
nano .env

# Verificar configurações
php artisan config:show

# Limpar caches antigos
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### 3. Setup do Banco de Dados

```bash
# Rodar migrações do banco central
php artisan migrate --force

# Criar seeders se necessário
php artisan db:seed --class=CentralSeeder --force

# Criar tenant de exemplo (se necessário)
php artisan tenancy:create exemplo
```

### 4. Otimizações de Produção

```bash
# Cache de configuração
php artisan config:cache

# Cache de rotas
php artisan route:cache

# Cache de views
php artisan view:cache

# Otimizar autoloader
composer dump-autoload --optimize

# Links simbólicos para storage
php artisan storage:link
```

### 5. Configurar Permissões

```bash
# Definir proprietário correto
chown -R www-data:www-data /var/www/saas-gamificacao

# Configurar permissões
chmod -R 755 /var/www/saas-gamificacao
chmod -R 775 /var/www/saas-gamificacao/storage
chmod -R 775 /var/www/saas-gamificacao/bootstrap/cache
```

## 🔄 Script de Deploy Automático

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando deploy..."

# Backup do banco de dados
echo "📦 Fazendo backup do banco..."
mysqldump -u root -p saas_gamificacao_central_staging > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull das últimas alterações
echo "📥 Atualizando código..."
git pull origin main

# Instalar/atualizar dependências
echo "📦 Instalando dependências..."
composer install --optimize-autoloader --no-dev
npm ci

# Compilar assets
echo "🔨 Compilando assets..."
npm run build

# Rodar migrações
echo "🗄️ Executando migrações..."
php artisan migrate --force

# Limpar e recriar caches
echo "🧹 Limpando caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Recriar caches otimizados
echo "⚡ Criando caches otimizados..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Reiniciar workers de queue (se usando)
echo "🔄 Reiniciando workers..."
php artisan queue:restart

echo "✅ Deploy concluído com sucesso!"
```

## 🔒 Configurações de Segurança

### SSL/HTTPS (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d your-domain.com -d *.your-domain.com

# Auto-renewal
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🔄 Queue e Cron Jobs

### Supervisor para Queues

```ini
[program:saas-gamificacao-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/saas-gamificacao/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/saas-gamificacao-worker.log
stopwaitsecs=3600
```

### Cron Jobs

```bash
# Adicionar ao crontab do usuário www-data
sudo crontab -u www-data -e

# Adicionar linha:
* * * * * cd /var/www/saas-gamificacao && php artisan schedule:run >> /dev/null 2>&1
```

## 📊 Monitoramento

### Log Files

```bash
# Logs da aplicação
tail -f storage/logs/laravel.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PHP-FPM
tail -f /var/log/php8.0-fpm.log
```

### Health Check Endpoint

Adicione ao `routes/web.php`:

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'version' => config('app.version', '1.0.0')
    ]);
});
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro 500**: Verificar logs em `storage/logs/laravel.log`
2. **Permissões**: `sudo chown -R www-data:www-data storage bootstrap/cache`
3. **Cache**: `php artisan config:clear && php artisan cache:clear`
4. **Assets 404**: Verificar se `npm run build` foi executado
5. **Multi-tenancy**: Verificar conexões de banco e DNS wildcard

### Comandos de Debug

```bash
# Verificar configuração
php artisan about

# Testar conexão com banco
php artisan tinker
DB::connection()->getPdo();

# Verificar rotas
php artisan route:list

# Verificar tenants
php artisan tenants:list
```

---

## 📞 Suporte

Para dúvidas sobre o deploy, consulte:
- Documentação Laravel: https://laravel.com/docs
- Documentação Stancl/Tenancy: https://tenancyforlaravel.com
- Logs da aplicação em `storage/logs/`