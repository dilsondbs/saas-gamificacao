<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Course;
use App\Models\Badge;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class TestMultiTenancy extends Command
{
    protected $signature = 'test:tenancy {action=overview}';

    protected $description = 'Test multi-tenancy setup and functionality';

    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'overview':
                $this->overview();
                break;
            case 'create':
                $this->createTestTenant();
                break;
            case 'test-isolation':
                $this->testDataIsolation();
                break;
            case 'cleanup':
                $this->cleanup();
                break;
            default:
                $this->error("Unknown action: {$action}");
                $this->info("Available actions: overview, create, test-isolation, cleanup");
        }
    }

    private function overview()
    {
        $this->info('=== Multi-Tenancy System Overview ===');
        $this->newLine();

        // Central database info
        $this->info('Central Database Status:');
        try {
            $tenants = Tenant::all();
            $this->line("• Total Tenants: " . $tenants->count());
            
            if ($tenants->count() > 0) {
                $this->line("• Tenants:");
                foreach ($tenants as $tenant) {
                    $domains = $tenant->domains()->pluck('domain')->join(', ');
                    $this->line("  - {$tenant->id} ({$domains})");
                }
            }
        } catch (\Exception $e) {
            $this->error("Error accessing central database: " . $e->getMessage());
            return;
        }

        $this->newLine();
        $this->info('Testing tenant database access:');
        
        foreach (Tenant::all() as $tenant) {
            try {
                tenancy()->initialize($tenant);
                
                $userCount = User::count();
                $courseCount = Course::count();
                $badgeCount = Badge::count();
                
                $this->line("• {$tenant->id}: {$userCount} users, {$courseCount} courses, {$badgeCount} badges");
                
                tenancy()->end();
            } catch (\Exception $e) {
                $this->error("  Error accessing tenant {$tenant->id}: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info('System is ready! Access tenants via:');
        $this->line('• Central: http://saas-gamificacao.local:8080');
        foreach (Tenant::all() as $tenant) {
            $domain = $tenant->domains->first()?->domain;
            if ($domain) {
                $this->line("• {$tenant->id}: http://{$domain}:8080");
            }
        }
    }

    private function createTestTenant()
    {
        $tenantId = $this->ask('Tenant ID', 'escola-' . rand(1000, 9999));
        
        if (Tenant::where('id', $tenantId)->exists()) {
            $this->error("Tenant {$tenantId} already exists!");
            return;
        }

        $this->info("Creating tenant: {$tenantId}");

        try {
            // Create tenant usando colunas físicas
            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => ucfirst($tenantId),
                'slug' => $tenantId,
                'plan' => 'basic',
                'is_active' => true,
                'max_users' => 50,
                'max_courses' => 20,
                'max_storage_mb' => 1000,
            ]);

            // Create domain
            $domain = "{$tenantId}.saas-gamificacao.local";
            $tenant->domains()->create(['domain' => $domain]);

            $this->info("✓ Tenant created successfully!");
            $this->line("  Domain: {$domain}");

            // Run migrations
            $this->info("Running migrations for tenant...");
            $this->call('tenants:migrate', ['--tenants' => [$tenantId]]);

            // Seed data
            if ($this->confirm('Seed with sample data?', true)) {
                $this->info("Seeding tenant database...");
                $this->call('tenants:seed', ['--tenants' => [$tenantId], '--class' => 'TenantSeeder']);
            }

            $this->info("✓ Tenant {$tenantId} is ready!");
            $this->info("Access at: http://{$domain}:8080");

        } catch (\Exception $e) {
            $this->error("Failed to create tenant: " . $e->getMessage());
        }
    }

    private function testDataIsolation()
    {
        $tenants = Tenant::limit(2)->get();
        
        if ($tenants->count() < 2) {
            $this->error("Need at least 2 tenants to test data isolation");
            return;
        }

        $this->info("Testing data isolation between tenants...");

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);
            
            // Create a test user
            $testUser = User::create([
                'name' => "Test User - {$tenant->id}",
                'email' => "test@{$tenant->id}.local",
                'password' => Hash::make('password'),
                'role' => 'student',
                'total_points' => 0,
            ]);

            $this->line("Created user in {$tenant->id}: {$testUser->email}");
            
            tenancy()->end();
        }

        $this->newLine();
        $this->info("Verifying isolation:");

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);
            
            $users = User::where('email', 'like', 'test@%')->get();
            $this->line("• {$tenant->id}: {$users->count()} test users");
            
            foreach ($users as $user) {
                $this->line("  - {$user->email}");
            }
            
            tenancy()->end();
        }

        $this->info("✓ Data isolation test completed!");
    }

    private function cleanup()
    {
        if (!$this->confirm('This will delete ALL test tenants and their data. Continue?')) {
            $this->info('Cancelled.');
            return;
        }

        $tenants = Tenant::where('id', 'like', 'escola-%')->orWhere('id', 'like', 'test-%')->get();
        
        foreach ($tenants as $tenant) {
            $this->info("Deleting tenant: {$tenant->id}");
            
            try {
                // Delete will trigger the database deletion via events
                $tenant->delete();
                $this->line("✓ Deleted {$tenant->id}");
            } catch (\Exception $e) {
                $this->error("Error deleting {$tenant->id}: " . $e->getMessage());
            }
        }

        $this->info("✓ Cleanup completed!");
    }
}
