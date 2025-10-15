<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupTestTenants extends Command
{
    protected $signature = 'cleanup:test-tenants {--force : Force cleanup without confirmation}';
    protected $description = 'Remove completely old test tenants (HARD DELETE for development)';

    public function handle()
    {
        $this->info('🧹 LIMPEZA DE TENANTS DE TESTE');

        // Find all soft-deleted tenants older than 1 hour
        $softDeletedTenants = Tenant::onlyTrashed()
            ->where('deleted_at', '<', now()->subHour())
            ->get();

        // Find tenants with test patterns (vemcomigoja, escola-teste, etc)
        $testPatterns = ['vemcomigoja%', 'escola-teste%', 'teste-%', '%-teste'];
        $testTenants = Tenant::withTrashed();

        foreach ($testPatterns as $pattern) {
            $testTenants->orWhere('slug', 'like', $pattern);
        }

        $testTenants = $testTenants->get();
        $allTenantsToClean = $softDeletedTenants->merge($testTenants)->unique('id');

        if ($allTenantsToClean->isEmpty()) {
            $this->info('✅ Nenhum tenant de teste encontrado para limpeza.');
            return Command::SUCCESS;
        }

        $this->table(['ID', 'Slug', 'Nome', 'Status'],
            $allTenantsToClean->map(function ($tenant) {
                return [
                    substr($tenant->id, 0, 8) . '...',
                    $tenant->slug,
                    $tenant->name,
                    $tenant->deleted_at ? 'SOFT DELETED' : 'ATIVO'
                ];
            })
        );

        if (!$this->option('force')) {
            if (!$this->confirm("🗑️ HARD DELETE de {$allTenantsToClean->count()} tenants? (IRREVERSÍVEL)")) {
                $this->info('❌ Operação cancelada.');
                return Command::SUCCESS;
            }
        }

        $this->info('🚀 Iniciando limpeza HARD DELETE...');

        foreach ($allTenantsToClean as $tenant) {
            try {
                $this->info("🗑️ Removendo: {$tenant->slug}");

                // 1. Remove domains first
                DB::table('domains')->where('tenant_id', $tenant->id)->delete();

                // 2. Drop tenant database
                $dbName = 'tenant' . $tenant->id;
                try {
                    DB::statement("DROP DATABASE IF EXISTS `{$dbName}`");
                    $this->line("   📦 Database dropado: {$dbName}");
                } catch (\Exception $e) {
                    $this->warn("   ⚠️ Erro ao dropar database: " . $e->getMessage());
                }

                // 3. Force delete tenant record
                $tenant->forceDelete();
                $this->line("   ✅ Tenant removido completamente");

            } catch (\Exception $e) {
                $this->error("   ❌ Erro ao remover {$tenant->slug}: " . $e->getMessage());
            }
        }

        $this->info('🎉 Limpeza concluída! Slugs liberados para reutilização.');
        return Command::SUCCESS;
    }
}