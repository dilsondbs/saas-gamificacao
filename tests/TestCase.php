<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Configure central domains for testing
        config([
            'tenancy.central_domains' => [
                'localhost',
                '127.0.0.1', 
                'saas-gamificacao.local',
                'localhost:8080',
                '127.0.0.1:8080',
                'saas-gamificacao.local:8080',
                // For testing purposes, treat these as central
                'testing.local',
                '127.0.0.1:8000',
            ]
        ]);
        
        // Set default server name for testing
        $this->serverVariables = [
            'SERVER_NAME' => 'localhost',
            'HTTP_HOST' => 'localhost',
        ];
        
        // Ensure we start in central context
        $this->ensureCentralContext();
        
        // Clean up any existing tenants from previous tests
        $this->cleanupTenants();
    }

    protected function tearDown(): void
    {
        // Clean up after each test
        $this->ensureCentralContext();
        
        // Clean up any tracked tenants first (more targeted)
        $this->cleanupCreatedTenants();
        
        // Then do general cleanup
        $this->cleanupTenants();
        
        parent::tearDown();
    }

    /**
     * Ensure we are in central context (not tenant context)
     */
    protected function ensureCentralContext(): void
    {
        if (app()->bound('tenant')) {
            tenancy()->end();
        }
        
        // Set default connection to central
        config(['database.default' => 'central']);
        DB::purge('tenant');
        DB::reconnect('central');
    }

    /**
     * Switch to tenant context for testing
     */
    protected function actAsTenant(string $tenantId): Tenant
    {
        $tenant = Tenant::find($tenantId);
        
        if (!$tenant) {
            throw new \Exception("Tenant {$tenantId} not found");
        }
        
        tenancy()->initialize($tenant);
        
        return $tenant;
    }

    /**
     * Create a test tenant with proper cleanup tracking
     */
    protected function createTestTenant(array $attributes = []): Tenant
    {
        $defaultAttributes = [
            'id' => 'test-' . uniqid(),
            'name' => 'Test Tenant',
            'slug' => 'test-tenant-' . uniqid(),
            'plan' => 'basic',
            'max_users' => 10,
            'max_courses' => 5,
            'max_storage_mb' => 100,
            'is_active' => true,
        ];

        $tenant = Tenant::create(array_merge($defaultAttributes, $attributes));
        
        // Create domain
        $tenant->domains()->create([
            'domain' => $tenant->slug . '.test.local'
        ]);

        return $tenant;
    }

    /**
     * Clean up all test tenants and their databases
     */
    protected function cleanupTenants(): void
    {
        try {
            // Ensure we're in central context for cleanup
            $this->ensureCentralContext();
            
            // Get all tenants
            $tenants = Tenant::all();
            
            foreach ($tenants as $tenant) {
                try {
                    // End tenant context if it's active
                    if (app()->bound('tenant') && tenancy()->tenant?->id === $tenant->id) {
                        tenancy()->end();
                    }
                    
                    // Delete tenant databases if they exist
                    $databaseName = 'tenant' . $tenant->id;
                    DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");
                    
                    // Clear any cached tenant connections
                    DB::purge('tenant');
                    
                } catch (\Exception $e) {
                    // Continue even if database deletion fails
                }
                
                // Delete tenant record (this also cleans domains via cascading)
                try {
                    $tenant->delete();
                } catch (\Exception $e) {
                    // Force delete domains first if cascade fails
                    try {
                        DB::connection('central')->table('domains')
                          ->where('tenant_id', $tenant->getKey())->delete();
                        $tenant->delete();
                    } catch (\Exception $e2) {
                        // Continue with other tenants
                    }
                }
            }
            
            // Clean remaining orphaned records
            DB::connection('central')->table('domains')->truncate();
            DB::connection('central')->table('tenants')->truncate();
            
            // Clear any application caches
            if (function_exists('cache')) {
                cache()->flush();
            }
            
        } catch (\Exception $e) {
            // If cleanup fails, continue with tests
            // This prevents cleanup issues from breaking all tests
        } finally {
            // Always ensure we end in central context
            $this->ensureCentralContext();
        }
    }

    /**
     * Helper to run code in tenant context then return to central
     */
    protected function runInTenantContext(string $tenantId, \Closure $callback)
    {
        $originalContext = app()->bound('tenant') ? tenancy()->tenant : null;
        
        try {
            $tenant = $this->actAsTenant($tenantId);
            $result = $callback($tenant);
            return $result;
        } finally {
            // Always end current tenant context
            if (app()->bound('tenant')) {
                tenancy()->end();
            }
            
            // Restore original context or ensure central
            if ($originalContext) {
                tenancy()->initialize($originalContext);
            } else {
                $this->ensureCentralContext();
            }
        }
    }

    /**
     * Helper to safely create tenant for testing with auto-cleanup tracking
     */
    protected function createTestTenantSafe(array $attributes = []): Tenant
    {
        // Ensure we're in central context
        $this->ensureCentralContext();
        
        $tenant = $this->createTestTenant($attributes);
        
        // Track this tenant for cleanup (if not already tracked)
        if (!isset($this->createdTenants)) {
            $this->createdTenants = collect();
        }
        
        $this->createdTenants->push($tenant->id);
        
        return $tenant;
    }

    /**
     * Enhanced cleanup that tracks created tenants during test
     */
    protected function cleanupCreatedTenants(): void
    {
        if (!isset($this->createdTenants) || $this->createdTenants->isEmpty()) {
            return;
        }
        
        $this->ensureCentralContext();
        
        foreach ($this->createdTenants as $tenantId) {
            try {
                $tenant = Tenant::find($tenantId);
                if ($tenant) {
                    // End context if active
                    if (app()->bound('tenant') && tenancy()->tenant?->id === $tenantId) {
                        tenancy()->end();
                    }
                    
                    // Delete database
                    $databaseName = 'tenant' . $tenantId;
                    DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");
                    DB::purge('tenant');
                    
                    // Delete tenant
                    $tenant->delete();
                }
            } catch (\Exception $e) {
                // Continue cleanup even if one fails
            }
        }
        
        $this->createdTenants = collect();
        $this->ensureCentralContext();
    }

    /**
     * Create a test request without tenancy middleware for central context testing
     */
    protected function withoutTenancyMiddleware()
    {
        return $this->withoutMiddleware([
            \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            \Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
        ]);
    }
}
