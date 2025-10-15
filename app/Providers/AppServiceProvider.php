<?php

namespace App\Providers;

use App\Services\TenantManager;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Registrar TenantManager como singleton
        $this->app->singleton(TenantManager::class, function ($app) {
            return new TenantManager();
        });

        // Registrar TenantContextService como singleton
        $this->app->singleton(\App\Services\TenantContextService::class, function ($app) {
            return new \App\Services\TenantContextService();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Configurar tenant_id como filtro global padrão será feito via middleware

        // CORREÇÃO DEFINITIVA: Forçar configuração correta no contexto web
        if (!app()->runningInConsole()) {
            \Log::info('AppServiceProvider BOOT - Forçando configuração correta no contexto web');

            // Forçar configuração padrão do banco
            config(['database.default' => 'mysql']);
            config(['database.connections.mysql.database' => 'saas_gamificacao']);
            config(['database.connections.central.database' => 'saas_gamificacao']);

            \Log::info('Configuração forçada:', [
                'default' => config('database.default'),
                'mysql_db' => config('database.connections.mysql.database'),
                'central_db' => config('database.connections.central.database')
            ]);
        }
    }
}
