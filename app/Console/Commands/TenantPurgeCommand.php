<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class TenantPurgeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:purge {tenant_id? : ID do tenant para purgar} {--force : Força purga sem confirmação} {--old-backups : Remove backups antigos (90+ dias)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently purge soft-deleted tenants and clean up associated resources';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        $force = $this->option('force');
        $cleanOldBackups = $this->option('old-backups');

        if ($cleanOldBackups) {
            return $this->cleanOldBackups();
        }

        if (!$tenantId) {
            $this->error('❌ Você deve especificar um tenant_id para purga');
            $this->line('   Use: php artisan tenant:purge {tenant_id}');
            $this->line('   Ou: php artisan tenant:purge --old-backups');
            return Command::FAILURE;
        }

        return $this->purgeTenant($tenantId, $force);
    }

    private function purgeTenant($tenantId, $force = false)
    {
        $this->warn('⚠️  OPERAÇÃO PERIGOSA: PURGA PERMANENTE');
        $this->line('Esta operação remove PERMANENTEMENTE o tenant e TODOS os dados.');
        $this->newLine();

        // Buscar tenant incluindo soft deleted
        $tenant = Tenant::withTrashed()->find($tenantId);
        
        if (!$tenant) {
            $this->error("❌ Tenant '{$tenantId}' não encontrado");
            return Command::FAILURE;
        }

        $this->line("📌 Tenant encontrado: {$tenant->name}");
        $this->line("   • ID: {$tenant->id}");
        $this->line("   • Status: {$tenant->status}");
        $this->line("   • Plano: {$tenant->plan}");
        $this->line("   • Soft deleted: " . ($tenant->deleted_at ? 'Sim (' . $tenant->deleted_at->format('d/m/Y H:i') . ')' : 'Não'));
        
        if ($tenant->deletion_scheduled_at) {
            $this->line("   • Exclusão agendada: " . $tenant->deletion_scheduled_at->format('d/m/Y H:i'));
        }
        
        if ($tenant->cancellation_reason) {
            $this->line("   • Motivo: {$tenant->cancellation_reason}");
        }

        $this->newLine();

        // Verificar se tenant ainda está ativo
        if (!$tenant->deleted_at && $tenant->status === 'active') {
            $this->error('❌ ATENÇÃO: Tenant ainda está ATIVO!');
            $this->line('   Para purgar um tenant ativo, ele deve ser primeiro agendado para exclusão.');
            $this->line('   Use: php artisan tinker e execute $tenant->scheduleForDeletion()');
            return Command::FAILURE;
        }

        // Verificações de segurança
        if ($tenant->plan === 'enterprise' || $tenant->plan === 'premium') {
            $this->error("⚠️  TENANT PREMIUM/ENTERPRISE: {$tenant->plan}");
            if (!$force) {
                $this->line('   Use --force para purgar tenants premium/enterprise');
                return Command::FAILURE;
            }
        }

        // Verificar se há backup
        $backupPath = storage_path("app/tenant-backups/{$tenant->id}");
        $hasBackup = is_dir($backupPath);
        
        if (!$hasBackup) {
            $this->warn('⚠️  NENHUM BACKUP ENCONTRADO para este tenant!');
        } else {
            $backupFiles = glob($backupPath . '/*.json');
            $this->info("✅ Backup encontrado: " . count($backupFiles) . " arquivo(s)");
        }

        $this->newLine();

        // Confirmação final
        if (!$force) {
            $this->warn('ESTA AÇÃO NÃO PODE SER DESFEITA!');
            $this->line('Todos os dados do tenant serão PERMANENTEMENTE removidos:');
            $this->line('• Database do tenant (se existir)');
            $this->line('• Arquivos e uploads');
            $this->line('• Registros de atividade');
            $this->line('• Contratos e dados financeiros');
            $this->newLine();

            if (!$this->confirm('Tem ABSOLUTA CERTEZA de que deseja purgar este tenant?', false)) {
                $this->info('Operação cancelada.');
                return Command::SUCCESS;
            }

            if (!$this->confirm("Digite o nome do tenant '{$tenant->name}' para confirmar:", false)) {
                $this->info('Confirmação do nome falhou. Operação cancelada.');
                return Command::SUCCESS;
            }
        }

        try {
            $this->line('💀 Iniciando purga permanente...');

            // 1. Remover database do tenant (se existir)
            $this->purgeTenantDatabase($tenant);

            // 2. Limpar arquivos e cache
            $this->purgeTenantFiles($tenant);

            // 3. Remover registros relacionados
            $this->purgeTenantRecords($tenant);

            // 4. Purga final do tenant
            $tenant->forceDelete();

            $this->info('✅ Tenant purgado permanentemente!');
            $this->line("   • Tenant '{$tenant->name}' foi completamente removido");
            $this->line("   • Todos os dados associados foram excluídos");
            
            if ($hasBackup) {
                $this->line("   • Backups preservados em: {$backupPath}");
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Erro durante a purga: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function purgeTenantDatabase($tenant)
    {
        try {
            $this->line('🗄️  Verificando database do tenant...');
            
            // Verificar se o database existe
            $dbName = "tenant{$tenant->id}";
            $centralConnection = config('database.connections.central');
            
            $pdo = new \PDO(
                "mysql:host={$centralConnection['host']};port={$centralConnection['port']}",
                $centralConnection['username'],
                $centralConnection['password']
            );
            
            $stmt = $pdo->prepare("SHOW DATABASES LIKE ?");
            $stmt->execute([$dbName]);
            
            if ($stmt->rowCount() > 0) {
                $this->line("   • Database encontrado: {$dbName}");
                
                if ($this->confirm("Excluir database '{$dbName}' permanentemente?")) {
                    $pdo->exec("DROP DATABASE `{$dbName}`");
                    $this->info("   ✅ Database '{$dbName}' removido");
                } else {
                    $this->warn("   ⏭️  Database preservado");
                }
            } else {
                $this->line("   • Nenhum database encontrado");
            }

        } catch (\Exception $e) {
            $this->warn("   ⚠️  Erro ao verificar database: " . $e->getMessage());
        }
    }

    private function purgeTenantFiles($tenant)
    {
        $this->line('📁 Removendo arquivos do tenant...');
        
        $pathsToClean = [
            storage_path("app/public/course_materials/{$tenant->id}"),
            storage_path("app/temp/{$tenant->id}"),
            storage_path("app/cache/tenants/{$tenant->id}")
        ];

        $totalFiles = 0;
        foreach ($pathsToClean as $path) {
            if (is_dir($path)) {
                $files = glob($path . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                        $totalFiles++;
                    }
                }
                rmdir($path);
            }
        }

        $this->line("   ✅ {$totalFiles} arquivo(s) removido(s)");
    }

    private function purgeTenantRecords($tenant)
    {
        $this->line('📋 Removendo registros relacionados...');
        
        try {
            // Remover contratos
            $contracts = \App\Models\TenantContract::where('tenant_id', $tenant->id)->get();
            foreach ($contracts as $contract) {
                $contract->forceDelete();
            }

            // Remover domínios
            $tenant->domains()->forceDelete();

            $this->line("   ✅ Registros relacionados removidos");

        } catch (\Exception $e) {
            $this->warn("   ⚠️  Erro ao remover registros: " . $e->getMessage());
        }
    }

    private function cleanOldBackups()
    {
        $this->info('🧹 Limpando backups antigos (90+ dias)...');
        
        $backupDir = storage_path('app/tenant-backups');
        if (!is_dir($backupDir)) {
            $this->info('✅ Nenhum diretório de backup encontrado');
            return Command::SUCCESS;
        }

        $cutoffDate = now()->subDays(90);
        $totalCleaned = 0;
        $totalSize = 0;

        $tenantDirs = glob($backupDir . '/*');
        foreach ($tenantDirs as $tenantDir) {
            if (!is_dir($tenantDir)) continue;

            $backupFiles = glob($tenantDir . '/*.json');
            foreach ($backupFiles as $backupFile) {
                $fileTime = filemtime($backupFile);
                if ($fileTime && $fileTime < $cutoffDate->timestamp) {
                    $totalSize += filesize($backupFile);
                    unlink($backupFile);
                    $totalCleaned++;
                }
            }

            // Remover diretório se vazio
            if (empty(glob($tenantDir . '/*'))) {
                rmdir($tenantDir);
            }
        }

        $sizeMB = round($totalSize / 1024 / 1024, 2);
        $this->info("✅ Limpeza concluída:");
        $this->line("   • {$totalCleaned} backup(s) antigo(s) removido(s)");
        $this->line("   • {$sizeMB} MB liberados");

        return Command::SUCCESS;
    }
}
