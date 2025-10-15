<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Stancl\Tenancy\Database\DatabaseManager;
use Stancl\Tenancy\Contracts\TenantWithDatabase;

class CreateOrUpdateTenantDatabase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tenant;

    /**
     * Create a new job instance.
     */
    public function __construct(TenantWithDatabase $tenant)
    {
        $this->tenant = $tenant;
    }

    /**
     * Execute the job.
     */
    public function handle(DatabaseManager $databaseManager)
    {
        try {
            // Try to create the database using the correct method
            $databaseManager->createTenant($this->tenant);
            \Log::info('✅ Banco do tenant criado com sucesso', [
                'tenant_id' => $this->tenant->getTenantKey(),
                'database_name' => $this->tenant->database()->getName()
            ]);
        } catch (\Exception $e) {
            // If database already exists, that's fine - just log it
            if (str_contains($e->getMessage(), 'already exists') ||
                str_contains($e->getMessage(), 'Database') && str_contains($e->getMessage(), 'exists') ||
                str_contains($e->getMessage(), 'cannot be created')) {
                \Log::info('ℹ️ Banco do tenant já existe - continuando', [
                    'tenant_id' => $this->tenant->getTenantKey(),
                    'database_name' => $this->tenant->database()->getName(),
                    'message' => $e->getMessage()
                ]);
            } else {
                // If it's a different error, rethrow it
                \Log::error('❌ Erro ao criar banco do tenant', [
                    'tenant_id' => $this->tenant->getTenantKey(),
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        }
    }
}
