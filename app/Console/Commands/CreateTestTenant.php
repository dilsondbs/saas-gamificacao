<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

class CreateTestTenant extends Command
{
    protected $signature = 'tenant:create-test';
    protected $description = 'Create a test tenant for development';

    public function handle()
    {
        // Check if tenant already exists
        $existingTenant = Tenant::where('data->slug', 'empresa-teste')->first();
        if ($existingTenant) {
            $this->info('Tenant empresa-teste already exists!');
            $this->info('ID: ' . $existingTenant->id);
            return;
        }

        // Create tenant
        $tenant = Tenant::create([
            'data' => [
                'name' => 'Empresa Teste',
                'slug' => 'empresa-teste',
                'description' => 'Empresa de teste do sistema',
                'plan' => 'premium',
                'max_users' => 50,
                'max_courses' => 25,
                'max_storage_mb' => 1000,
                'is_active' => true,
                'trial_ends_at' => now()->addDays(30)->toDateTimeString()
            ]
        ]);

        // Create domain
        $domain = Domain::create([
            'domain' => 'empresa-teste.localhost',
            'tenant_id' => $tenant->id
        ]);

        $this->info('✅ Tenant criado com sucesso!');
        $this->info('📧 ID: ' . $tenant->id);
        $this->info('🏢 Nome: Empresa Teste');
        $this->info('🌐 Domínio: ' . $domain->domain);

        return Command::SUCCESS;
    }
}
