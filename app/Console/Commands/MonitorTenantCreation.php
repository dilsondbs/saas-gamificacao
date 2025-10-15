<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MonitorTenantCreation extends Command
{
    protected $signature = 'tenant:monitor-creation {--follow : Follow the log continuously}';
    protected $description = 'Monitor tenant creation processes in real-time';

    public function handle()
    {
        $this->info('🔍 MONITORAMENTO DE CRIAÇÃO DE TENANTS');
        $this->info('=====================================');
        $this->newLine();

        if ($this->option('follow')) {
            $this->info('📊 Monitoramento contínuo ativado (Ctrl+C para parar)');
            $this->monitorContinuous();
        } else {
            $this->monitorStatus();
        }
    }

    private function monitorContinuous()
    {
        $logFile = storage_path('logs/laravel.log');

        if (!file_exists($logFile)) {
            $this->error('❌ Arquivo de log não encontrado: ' . $logFile);
            return;
        }

        $this->info("📋 Seguindo logs de: {$logFile}");
        $this->newLine();

        // Get current file size to start from end
        $lastSize = filesize($logFile);

        while (true) {
            clearstatcache();
            $currentSize = filesize($logFile);

            if ($currentSize > $lastSize) {
                $file = fopen($logFile, 'r');
                fseek($file, $lastSize);

                while (($line = fgets($file)) !== false) {
                    // Filter for tenant creation related logs
                    if (strpos($line, 'CRIAÇÃO') !== false ||
                        strpos($line, 'TENANT') !== false ||
                        strpos($line, 'creation_id') !== false ||
                        strpos($line, '🚀') !== false ||
                        strpos($line, '✅') !== false ||
                        strpos($line, '🚫') !== false ||
                        strpos($line, '⚠️') !== false) {

                        $this->formatLogLine($line);
                    }
                }

                fclose($file);
                $lastSize = $currentSize;
            }

            usleep(500000); // 0.5 second delay
        }
    }

    private function monitorStatus()
    {
        $this->info('📊 VERIFICANDO STATUS ATUAL DOS PROCESSOS DE CRIAÇÃO');
        $this->newLine();

        // Check cache for active creation processes
        $cacheKeys = $this->getAllCacheKeys();
        $activeCreations = [];

        foreach ($cacheKeys as $key) {
            if (strpos($key, 'tenant_creation_') === 0 && !strpos($key, '_result')) {
                $status = cache()->get($key);
                if ($status) {
                    $creationId = str_replace('tenant_creation_', '', $key);
                    $activeCreations[$creationId] = $status;
                }
            }
        }

        if (empty($activeCreations)) {
            $this->info('✨ Nenhum processo de criação ativo no momento');
        } else {
            $this->table(
                ['ID', 'Status', 'Progresso', 'Etapa', 'Plano', 'Slug', 'Mensagem'],
                collect($activeCreations)->map(function ($status, $id) {
                    return [
                        substr($id, 0, 8) . '...',
                        $this->colorStatus($status['status']),
                        $status['progress'] . '%',
                        $status['current_step'] ?? 'N/A',
                        $status['plan'] ?? 'N/A',
                        $status['tenant_slug'] ?? 'N/A',
                        $status['message'] ?? 'N/A'
                    ];
                })->toArray()
            );
        }

        $this->newLine();
        $this->info('💡 Use --follow para monitoramento contínuo');
    }

    private function formatLogLine($line)
    {
        $timestamp = now()->format('H:i:s');

        if (strpos($line, '🚀') !== false) {
            $this->line("<fg=green>[{$timestamp}]</> " . trim($line));
        } elseif (strpos($line, '✅') !== false) {
            $this->line("<fg=blue>[{$timestamp}]</> " . trim($line));
        } elseif (strpos($line, '🚫') !== false) {
            $this->line("<fg=red>[{$timestamp}]</> " . trim($line));
        } elseif (strpos($line, '⚠️') !== false) {
            $this->line("<fg=yellow>[{$timestamp}]</> " . trim($line));
        } else {
            $this->line("<fg=gray>[{$timestamp}]</> " . trim($line));
        }
    }

    private function colorStatus($status)
    {
        switch ($status) {
            case 'started':
                return '<fg=yellow>🔄 ' . $status . '</>';
            case 'running':
                return '<fg=blue>⚡ ' . $status . '</>';
            case 'completed':
                return '<fg=green>✅ ' . $status . '</>';
            case 'failed':
                return '<fg=red>❌ ' . $status . '</>';
            default:
                return $status;
        }
    }

    private function getAllCacheKeys()
    {
        // This is a simplified approach - in production you might want to use Redis KEYS or similar
        // For now, we'll simulate by checking common patterns
        $keys = [];

        // Try to get some common patterns (this is basic, in production use proper cache inspection)
        for ($i = 0; $i < 100; $i++) {
            $testKey = "tenant_creation_" . str_repeat('0', $i % 10);
            if (cache()->has($testKey)) {
                $keys[] = $testKey;
            }
        }

        return $keys;
    }
}