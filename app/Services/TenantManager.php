<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class TenantManager
{
    private $currentTenant = null;
    private $currentTenantId = null;

    /**
     * Define o tenant ativo na sessão
     */
    public function setTenant($tenantId)
    {
        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant) {
                $this->currentTenant = $tenant;
                $this->currentTenantId = $tenantId;
                Session::put('current_tenant_id', $tenantId);
                return true;
            }
        }
        return false;
    }

    /**
     * Retorna o tenant ativo
     */
    public function getTenant()
    {
        if (!$this->currentTenant) {
            $this->loadCurrentTenant();
        }
        return $this->currentTenant;
    }

    /**
     * Retorna o ID do tenant ativo
     */
    public function getTenantId()
    {
        if (!$this->currentTenantId) {
            $this->loadCurrentTenant();
        }
        return $this->currentTenantId;
    }

    /**
     * Troca de tenant
     */
    public function switch($tenantId)
    {
        return $this->setTenant($tenantId);
    }

    /**
     * Limpa o tenant da sessão
     */
    public function clear()
    {
        $this->currentTenant = null;
        $this->currentTenantId = null;
        Session::forget('current_tenant_id');
    }

    /**
     * Verifica se há um tenant ativo
     */
    public function hasTenant()
    {
        return $this->getTenantId() !== null;
    }

    /**
     * Carrega o tenant atual da sessão, do usuário logado ou pelo domínio
     */
    private function loadCurrentTenant()
    {
        // Primeiro tenta da sessão
        $tenantId = Session::get('current_tenant_id');

        // Se não tem na sessão, tenta do usuário logado
        if (!$tenantId && Auth::check() && Auth::user()->tenant_id) {
            $tenantId = Auth::user()->tenant_id;
        }

        // Se ainda não tem tenant_id, tenta determinar pelo domínio
        if (!$tenantId) {
            $tenantId = $this->getTenantIdByDomain();
        }

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant) {
                $this->currentTenant = $tenant;
                $this->currentTenantId = $tenantId;
                Session::put('current_tenant_id', $tenantId);
            }
        }
    }

    /**
     * Determina o tenant_id baseado no domínio atual
     */
    private function getTenantIdByDomain()
    {
        $host = request()->getHost();

        // Se é domínio central, não há tenant
        if ($this->isCentralDomain()) {
            return null;
        }

        // Tentar mapear domínio para tenant
        // Padrão: subdomain.saas-gamificacao.local -> tenant com slug = subdomain
        if (str_contains($host, '.saas-gamificacao.local')) {
            $subdomain = str_replace('.saas-gamificacao.local', '', $host);
            $tenant = Tenant::where('slug', $subdomain)->first();
            return $tenant ? $tenant->id : null;
        }

        // Para domínios como escola-teste.saas-gamificacao.local
        if (str_contains($host, 'saas-gamificacao.local')) {
            $parts = explode('.', $host);
            $subdomain = $parts[0]; // Pega a primeira parte antes do primeiro ponto
            $tenant = Tenant::where('slug', $subdomain)->first();
            return $tenant ? $tenant->id : null;
        }

        return null;
    }

    /**
     * Verifica se o tenant está ativo
     */
    public function isActive()
    {
        $tenant = $this->getTenant();
        return $tenant && $tenant->is_active;
    }

    /**
     * Verifica se é o domínio central
     */
    public function isCentralDomain()
    {
        $host = request()->getHost();
        $centralDomains = ['127.0.0.1', 'localhost', 'saas-gamificacao.local'];
        return in_array($host, $centralDomains);
    }
}