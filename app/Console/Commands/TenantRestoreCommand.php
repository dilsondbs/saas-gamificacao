<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class TenantRestoreCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:restore {tenant_id? : ID do tenant para restaurar} {--all : Restaurar todos os tenants elegíveis} {--list : Listar tenants elegíveis para restauração}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore tenants from pending deletion status within grace period';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        $restoreAll = $this->option('all');
        $listOnly = $this->option('list');

        if ($listOnly) {
            return $this->listEligibleTenants();
        }

        if ($restoreAll) {
            return $this->restoreAllEligible();
        }

        if (!$tenantId) {
            $this->error('❌ Você deve especificar um tenant_id ou usar --all ou --list');
            return Command::FAILURE;
        }

        return $this->restoreTenant($tenantId);
    }

    private function listEligibleTenants()
    {
        $this->info('📋 Listando tenants elegíveis para restauração...');
        
        $eligibleTenants = Tenant::pendingDeletion()
            ->where('deletion_scheduled_at', '>', now())
            ->orderBy('deletion_scheduled_at')
            ->get();

        if ($eligibleTenants->isEmpty()) {
            $this->info('✅ Nenhum tenant elegível para restauração encontrado');
            return Command::SUCCESS;
        }

        $this->info("📋 Encontrados {$eligibleTenants->count()} tenant(s) elegível(eis):");
        $this->newLine();

        foreach ($eligibleTenants as $tenant) {
            $daysRemaining = $tenant->getDaysUntilDeletion();
            $this->line("📌 {$tenant->name} (ID: {$tenant->id})");
            $this->line("   • Plano: {$tenant->plan}");
            $this->line("   • Exclusão em: {$daysRemaining} dia(s)");
            $this->line("   • Motivo: {$tenant->cancellation_reason}");
            $this->line("   • Agendado em: " . $tenant->deletion_scheduled_at->format('d/m/Y H:i'));
            $this->newLine();
        }

        return Command::SUCCESS;
    }

    private function restoreAllEligible()
    {
        $this->warn('⚠️  RESTAURAÇÃO EM MASSA');
        $this->line('Esta operação irá restaurar TODOS os tenants elegíveis.');
        
        if (!$this->confirm('Tem certeza de que deseja continuar?', false)) {
            $this->info('Operação cancelada.');
            return Command::SUCCESS;
        }

        $eligibleTenants = Tenant::pendingDeletion()
            ->where('deletion_scheduled_at', '>', now())
            ->get();

        if ($eligibleTenants->isEmpty()) {
            $this->info('✅ Nenhum tenant elegível para restauração encontrado');
            return Command::SUCCESS;
        }

        $this->info("🔄 Restaurando {$eligibleTenants->count()} tenant(s)...");
        $this->newLine();

        $totalRestored = 0;
        $totalErrors = 0;

        foreach ($eligibleTenants as $tenant) {
            $this->line("🔄 Restaurando: {$tenant->name}...");
            
            try {
                $restored = $tenant->restoreFromPendingDeletion();
                if ($restored) {
                    $totalRestored++;
                    $this->info("   ✅ Restaurado com sucesso!");
                } else {
                    $totalErrors++;
                    $this->error("   ❌ Falha na restauração");
                }
            } catch (\Exception $e) {
                $totalErrors++;
                $this->error("   ❌ Erro: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("📊 RESUMO:");
        $this->line("   • Tenants restaurados: {$totalRestored}");
        $this->line("   • Erros: {$totalErrors}");

        return $totalErrors > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    private function restoreTenant($tenantId)
    {
        $this->info("🔍 Procurando tenant: {$tenantId}");

        $tenant = Tenant::find($tenantId);
        
        if (!$tenant) {
            $this->error("❌ Tenant '{$tenantId}' não encontrado");
            return Command::FAILURE;
        }

        $this->line("📌 Tenant encontrado: {$tenant->name}");
        $this->line("   • Status: {$tenant->status}");
        $this->line("   • Plano: {$tenant->plan}");

        if (!$tenant->isPendingDeletion()) {
            $this->error("❌ Tenant não está pendente de exclusão");
            return Command::FAILURE;
        }

        if (!$tenant->canBeRestored()) {
            $this->error("❌ Tenant não pode ser restaurado (período de carência expirado)");
            $this->line("   • Exclusão agendada para: " . $tenant->deletion_scheduled_at->format('d/m/Y H:i'));
            return Command::FAILURE;
        }

        $daysRemaining = $tenant->getDaysUntilDeletion();
        $this->line("   • Exclusão em: {$daysRemaining} dia(s)");
        $this->line("   • Motivo do cancelamento: {$tenant->cancellation_reason}");
        $this->newLine();

        if (!$this->confirm("Confirma a restauração do tenant '{$tenant->name}'?")) {
            $this->info('Operação cancelada.');
            return Command::SUCCESS;
        }

        try {
            $this->line('🔄 Executando restauração...');
            $restored = $tenant->restoreFromPendingDeletion();
            
            if ($restored) {
                $this->info('✅ Tenant restaurado com sucesso!');
                $this->line("   • Status atual: {$tenant->fresh()->status}");
                $this->line("   • Tenant ativo novamente");
                return Command::SUCCESS;
            } else {
                $this->error('❌ Falha na restauração do tenant');
                return Command::FAILURE;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Erro na restauração: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
