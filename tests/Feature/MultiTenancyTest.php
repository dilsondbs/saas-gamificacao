<?php

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Domain;
use Illuminate\Support\Facades\DB;

class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use central connection for these tests
        config(['database.default' => 'central']);
    }

    /** @test */
    public function it_can_create_a_tenant()
    {
        // Create tenant using direct database insertion first
        DB::connection('central')->table('tenants')->insert([
            'id' => 'test-tenant',
            'name' => 'Test School',
            'slug' => 'test-school', 
            'description' => 'A test school for unit testing',
            'plan' => 'basic',
            'max_users' => 50,
            'max_courses' => 10,
            'max_storage_mb' => 500,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $this->assertDatabaseHas('tenants', [
            'id' => 'test-tenant',
            'name' => 'Test School',
            'slug' => 'test-school',
            'plan' => 'basic'
        ]);

        // Now test if we can retrieve it via Eloquent
        $tenant = Tenant::find('test-tenant');
        $this->assertNotNull($tenant);
        $this->assertEquals('Test School', $tenant->name);
        $this->assertEquals('basic', $tenant->plan);
    }

    /** @test */
    public function it_can_create_a_domain_for_tenant()
    {
        $tenant = Tenant::create([
            'id' => 'test-tenant',
            'name' => 'Test School',
            'slug' => 'test-school'
        ]);

        $domain = $tenant->domains()->create([
            'domain' => 'test-school.saas-gamificacao.local'
        ]);

        $this->assertDatabaseHas('domains', [
            'domain' => 'test-school.saas-gamificacao.local',
            'tenant_id' => 'test-tenant'
        ]);
    }

    /** @test */
    public function tenant_has_default_plan_settings()
    {
        $tenant = Tenant::create([
            'id' => 'basic-tenant',
            'name' => 'Basic School',
            'slug' => 'basic-school'
        ]);

        $this->assertEquals('basic', $tenant->plan);
        $this->assertEquals(10, $tenant->max_users);
        $this->assertEquals(5, $tenant->max_courses);
        $this->assertEquals(100, $tenant->max_storage_mb);
        $this->assertTrue($tenant->is_active);
    }

    /** @test */
    public function tenant_slug_must_be_unique()
    {
        Tenant::create([
            'id' => 'tenant-1',
            'name' => 'School One',
            'slug' => 'unique-school'
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Tenant::create([
            'id' => 'tenant-2', 
            'name' => 'School Two',
            'slug' => 'unique-school' // Same slug should fail
        ]);
    }

    /** @test */
    public function it_validates_tenant_plan_limits()
    {
        $basicTenant = Tenant::create([
            'id' => 'basic-tenant',
            'name' => 'Basic School',
            'slug' => 'basic-school',
            'plan' => 'basic'
        ]);

        $premiumTenant = Tenant::create([
            'id' => 'premium-tenant',
            'name' => 'Premium School', 
            'slug' => 'premium-school',
            'plan' => 'premium',
            'max_users' => 100,
            'max_courses' => 25,
            'max_storage_mb' => 1000
        ]);

        // Basic tenant should have lower limits
        $this->assertLessThan($premiumTenant->max_users, $basicTenant->max_users);
        $this->assertLessThan($premiumTenant->max_courses, $basicTenant->max_courses);
        $this->assertLessThan($premiumTenant->max_storage_mb, $basicTenant->max_storage_mb);
    }
}