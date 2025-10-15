<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class TenantCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:cleanup {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up tenants that are overdue for deletion';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('🧹 Iniciando limpeza automática de tenants...');
        
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->warn('🔍 Modo DRY-RUN ativado - nenhuma exclusão será executada');
        }

        // Buscar tenants vencidos para exclusão
        $overduetenants = Tenant::overdueForDeletion()->get();
        
        if ($overduetenants->isEmpty()) {
            $this->info('✅ Nenhum tenant vencido encontrado para limpeza');
            return Command::SUCCESS;
        }

        $this->info("📋 Encontrados {$overduetenants->count()} tenant(s) vencido(s) para exclusão:");
        
        $totalProcessed = 0;
        $totalSuccess = 0;
        $totalErrors = 0;

        foreach ($overduetenants as $tenant) {
            $totalProcessed++;
            
            $daysOverdue = abs($tenant->getDaysUntilDeletion());
            
            $this->line("\n📌 Processando tenant: {$tenant->name}");
            $this->line("   • ID: {$tenant->id}");
            $this->line("   • Plano: {$tenant->plan}");
            $this->line("   • Vencido há: {$daysOverdue} dia(s)");
            $this->line("   • Motivo: {$tenant->cancellation_reason}");
            
            if ($dryRun) {
                $this->warn('   🔍 [DRY-RUN] Este tenant seria excluído');
                continue;
            }

            try {
                // Confirmar exclusão para tenants críticos
                if ($tenant->plan === 'enterprise' || $tenant->plan === 'premium') {
                    if (!$this->confirm("⚠️  Tenant '{$tenant->name}' é {$tenant->plan}. Confirma exclusão?", false)) {
                        $this->warn('   ⏭️  Exclusão cancelada pelo usuário');
                        continue;
                    }
                }

                $this->line('   🗑️  Executando exclusão final...');
                
                // Executar exclusão final com limpeza
                $result = $tenant->executeFinalDeletion();
                
                if ($result['success']) {
                    $totalSuccess++;
                    $this->info('   ✅ Tenant excluído com sucesso!');
                    
                    if (isset($result['cleanup_results'])) {
                        $cleanup = $result['cleanup_results'];
                        $this->line("      - Arquivos removidos: {$cleanup['files_deleted']}");
                        $this->line("      - Cache limpo: " . ($cleanup['cache_cleared'] ? 'Sim' : 'Não'));
                        $this->line("      - Backup criado: " . ($cleanup['backup_created'] ? 'Sim' : 'Não'));
                    }
                    
                } else {
                    $totalErrors++;
                    $this->error('   ❌ Falha na exclusão: ' . ($result['error'] ?? 'Erro desconhecido'));
                }
                
            } catch (\Exception $e) {
                $totalErrors++;
                $this->error('   ❌ Erro inesperado: ' . $e->getMessage());
            }
        }

        // Resumo final
        $this->line("\n" . str_repeat('=', 50));
        $this->info('📊 RESUMO DA LIMPEZA:');
        $this->line("   • Tenants processados: {$totalProcessed}");
        $this->line("   • Exclusões bem-sucedidas: {$totalSuccess}");
        $this->line("   • Erros: {$totalErrors}");
        
        if ($dryRun) {
            $this->warn('   • Modo DRY-RUN: Nenhuma exclusão foi executada');
        }
        
        if ($totalErrors > 0) {
            $this->error("\n⚠️  Alguns tenants tiveram problemas na exclusão. Verifique os logs.");
            return Command::FAILURE;
        }

        $this->info("\n🎉 Limpeza concluída com sucesso!");
        return Command::SUCCESS;
    }
}
