# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel 9 application with React frontend using Inertia.js, designed for a SaaS gamification platform. The stack combines:

- **Backend**: Laravel 9 (PHP 8.0.2+) with Laravel Sanctum for authentication
- **Frontend**: React 18 with Inertia.js for SPA-like behavior
- **Styling**: Tailwind CSS with HeadlessUI components
- **Build Tool**: Vite for asset compilation
- **Testing**: PHPUnit for backend tests

## Key Development Commands

### Laravel/PHP Commands
- `php artisan serve` - Start development server
- `php artisan migrate` - Run database migrations
- `php artisan migrate:fresh --seed` - Fresh migration with seeders
- `php artisan test` - Run PHPUnit tests
- `php artisan tinker` - Interactive PHP shell
- `php artisan make:controller ControllerName` - Generate controller
- `php artisan make:model ModelName -m` - Generate model with migration
- `php artisan route:list` - List all routes
- `php artisan config:clear` - Clear configuration cache
- `php artisan cache:clear` - Clear application cache

### Frontend/Asset Commands
- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build assets for production
- `composer install` - Install PHP dependencies
- `npm install` - Install Node.js dependencies

### Testing
- `php artisan test` - Run all PHPUnit tests
- `php artisan test --filter=TestName` - Run specific test
- `php artisan test tests/Feature/` - Run feature tests only
- `php artisan test tests/Unit/` - Run unit tests only

## Architecture Overview

### Backend Structure
- **Models**: Located in `app/Models/` - Eloquent ORM models
- **Controllers**: Located in `app/Http/Controllers/` - Handle HTTP requests
- **Middleware**: Located in `app/Http/Middleware/` - Request filtering
- **Routes**: 
  - `routes/web.php` - Web routes using Inertia
  - `routes/auth.php` - Authentication routes (Laravel Breeze)
  - `routes/api.php` - API routes (if needed)
- **Database**: `database/migrations/` for schema, `database/seeders/` for data

### Frontend Structure
- **React Components**: Located in `resources/js/Components/`
- **Page Components**: Located in `resources/js/Pages/` - Inertia page components
- **Layouts**: Located in `resources/js/Layouts/` - Page layout components
- **Entry Point**: `resources/js/app.jsx` - Main application bootstrap
- **Styles**: `resources/css/app.css` - Tailwind CSS entry point

### Authentication System
Uses Laravel Breeze with Inertia.js stack:
- Complete authentication scaffolding in `app/Http/Controllers/Auth/`
- React-based auth pages in `resources/js/Pages/Auth/`
- Routes defined in `routes/auth.php`
- User model with Sanctum API tokens support

### Frontend-Backend Communication
- **Inertia.js**: Provides SPA-like experience with server-side rendering
- **Ziggy**: Route helper for generating Laravel routes in JavaScript
- **Axios**: HTTP client for additional API calls if needed

## Development Workflow

### Setting Up New Features
1. Create backend routes in appropriate route file
2. Generate controller with `php artisan make:controller`
3. Create/update models and migrations if needed
4. Build React components in `resources/js/Components/`
5. Create page components in `resources/js/Pages/`
6. Update layouts if necessary

### Database Changes
1. Create migration: `php artisan make:migration create_table_name`
2. Update models in `app/Models/`
3. Run migration: `php artisan migrate`
4. Update seeders if needed in `database/seeders/`

### Frontend Development
- Components use Tailwind CSS for styling
- HeadlessUI components for accessible UI elements
- Inertia.js handles navigation and data flow
- Vite provides hot reload during development

## Multi-Tenancy Setup

This project uses **Stancl/Tenancy** for multi-tenancy with database-per-tenant isolation.

### Database Configuration
- **Central Database**: `saas_gamificacao_central` (manages tenants and domains)
- **Tenant Databases**: Each tenant gets their own database (`tenant[tenant-id]`)
- **Connection**: Central uses 'central', tenants use 'mysql' connection

### Important Configuration

#### Environment Setup
- Copy `.env.example` to `.env` and configure database/app settings
- Set `DB_CONNECTION=central` for central database
- Configure tenant database credentials with `TENANT_DB_*` variables
- Run `php artisan key:generate` to generate application key

#### Multi-Tenancy Features
- **Tenant Creation**: Creates isolated database per tenant
- **Domain Mapping**: Subdomains map to tenants (e.g., `escola1.saas-gamificacao.local`)
- **Data Isolation**: Complete separation between tenants
- **Central Management**: Admin panel for tenant management

#### Key Commands

**System Testing:**
```bash
# Overview of multi-tenancy system
php artisan test:tenancy overview

# Create new tenant interactively  
php artisan test:tenancy create

# Test data isolation between tenants
php artisan test:tenancy test-isolation

# Clean up test tenants
php artisan test:tenancy cleanup
```

**Manual Tenant Management:**
```bash
# Create a tenant manually
php artisan tinker
$tenant = App\Models\Tenant::create(['id' => 'escola-teste']);
$tenant->domains()->create(['domain' => 'escola-teste.saas-gamificacao.local']);

# Run tenant migrations
php artisan tenants:migrate --tenants=escola-teste

# Seed tenant data
php artisan tenants:seed --tenants=escola-teste --class=TenantSeeder

# List all tenants
php artisan tenants:list

# Fresh migrate all tenants
php artisan tenants:migrate-fresh --tenants=all
```

### Asset Compilation
- Vite configuration in `vite.config.js`
- Main entry point: `resources/js/app.jsx`
- CSS entry point: `resources/css/app.css`
- Build assets with `npm run build` for production

### Testing Configuration
- PHPUnit configuration in `phpunit.xml`
- Test environment variables configured in phpunit.xml
- Feature tests in `tests/Feature/`
- Unit tests in `tests/Unit/`

### Routing Structure

#### **Central Routes** (`routes/central.php`)
- **Purpose**: Landlord/SaaS management functionality
- **Domains**: Accessed only from central domains (saas-gamificacao.local)
- **Features**: 
  - Tenant management and creation
  - Billing and subscription management
  - Public marketing pages
  - SaaS admin dashboard

#### **Tenant Routes** (`routes/tenant.php`)
- **Purpose**: Tenant-specific application functionality  
- **Domains**: Accessed from tenant subdomains (escola1.saas-gamificacao.local)
- **Features**: 
  - Tenant-isolated application features
  - Multi-database tenancy context
  - Tenant-specific middleware protection

#### **Web Routes** (`routes/web.php`)
- **Purpose**: Shared authentication and common functionality
- **Context**: Works in both central and tenant contexts
- **Features**:
  - Laravel Breeze authentication (login, register, etc.)
  - Profile management
  - Shared utilities and components

#### **Additional Route Files**
- `routes/auth.php`: Authentication routes (Laravel Breeze)
- `routes/api.php`: API endpoints if needed
- `routes/console.php`: Artisan console commands  
- `routes/channels.php`: Broadcasting channels

## Como Acessar os Tenants

### OPÇÃO 1: Configurar arquivo hosts (RECOMENDADO para desenvolvimento)

1. **Abra o Notepad como Administrador**
2. **Abra o arquivo**: `C:\Windows\System32\drivers\etc\hosts`
3. **Adicione essas linhas no final**:
```
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
```
4. **Salve o arquivo**
5. **Acesse no navegador**: `http://escola-teste.saas-gamificacao.local:8080`

### OPÇÃO 2: Ver informações de desenvolvimento

1. **Acesse**: `http://127.0.0.1:8080/tenants-dev`
2. **Veja todos os tenants** e comandos para teste
3. **Use comandos curl** para testar via terminal

### Usuários de Teste Criados
- **Admin**: `admin@saas-gamificacao.com` / `password`
- **Instrutor**: `joao@saas-gamificacao.com` / `password`  
- **Alunos**: `aluno1@saas-gamificacao.com` até `aluno10@saas-gamificacao.com` / `password`

### URLs Importantes
- **Central (SaaS)**: `http://127.0.0.1:8080/login`
- **Dashboard Central**: `http://127.0.0.1:8080/central/dashboard`
- **Info Tenants**: `http://127.0.0.1:8080/tenants-dev`
- **Tenant Exemplo**: `http://escola-teste.saas-gamificacao.local:8080` (após configurar hosts)