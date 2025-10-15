<?php

use App\Services\TenantManager;

if (!function_exists('tenant')) {
    /**
     * Retorna o tenant atual
     */
    function tenant()
    {
        return app(TenantManager::class)->getTenant();
    }
}

if (!function_exists('tenant_id')) {
    /**
     * Retorna o ID do tenant atual
     */
    function tenant_id()
    {
        return app(TenantManager::class)->getTenantId();
    }
}

if (!function_exists('is_central_domain')) {
    /**
     * Verifica se está no domínio central
     */
    function is_central_domain()
    {
        return app(TenantManager::class)->isCentralDomain();
    }
}

if (!function_exists('tenant_manager')) {
    /**
     * Retorna a instância do TenantManager
     */
    function tenant_manager()
    {
        return app(TenantManager::class);
    }
}

if (!function_exists('has_tenant')) {
    /**
     * Verifica se há um tenant ativo
     */
    function has_tenant()
    {
        return app(TenantManager::class)->hasTenant();
    }
}

if (!function_exists('tenant_switch')) {
    /**
     * Troca de tenant
     */
    function tenant_switch($tenantId)
    {
        return app(TenantManager::class)->switch($tenantId);
    }
}

if (!function_exists('tenant_clear')) {
    /**
     * Limpa o tenant da sessão
     */
    function tenant_clear()
    {
        return app(TenantManager::class)->clear();
    }
}