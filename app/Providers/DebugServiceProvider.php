<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class DebugServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        // Log da configuração durante o boot
        \Log::info('DebugServiceProvider BOOT - Configuração atual:', [
            'default' => config('database.default'),
            'mysql_db' => config('database.connections.mysql.database'),
            'central_db' => config('database.connections.central.database'),
            'context' => app()->runningInConsole() ? 'CLI' : 'WEB'
        ]);

        // Registrar listener para mudanças de configuração
        $this->app->resolving('config', function ($config, $app) {
            \Log::info('Config sendo resolvido');
        });
    }
}