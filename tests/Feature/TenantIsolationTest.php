<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Course;
use App\Models\Tenant;
use App\Services\TenantContextService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Desabilitar verificação de CSRF para testes
        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    /** @test */
    public function users_can_only_see_data_from_their_tenant()
    {
        // Criar dois tenants com IDs string
        $tenant1 = Tenant::create([
            'id' => 'tenant-1-uuid',
            'name' => 'Tenant 1',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        $tenant2 = Tenant::create([
            'id' => 'tenant-2-uuid',
            'name' => 'Tenant 2',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        // Criar usuários para cada tenant
        $user1 = User::create([
            'name' => 'User 1',
            'email' => 'user1@tenant1.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'tenant_id' => $tenant1->id,
        ]);

        $user2 = User::create([
            'name' => 'User 2',
            'email' => 'user2@tenant2.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'tenant_id' => $tenant2->id,
        ]);

        // Criar cursos para cada tenant
        $course1 = Course::create([
            'title' => 'Course 1',
            'description' => 'Description 1',
            'status' => 'published',
            'instructor_id' => $user1->id,
            'tenant_id' => $tenant1->id,
        ]);

        $course2 = Course::create([
            'title' => 'Course 2',
            'description' => 'Description 2',
            'status' => 'published',
            'instructor_id' => $user2->id,
            'tenant_id' => $tenant2->id,
        ]);

        // Simular login do User 1 (Tenant 1)
        $this->actingAs($user1);

        $tenantContextService = app(TenantContextService::class);
        $tenantContextService->setCurrentTenant($tenant1->id);

        // User 1 deve ver apenas seus dados
        $visibleCourses = Course::all();
        $this->assertCount(1, $visibleCourses);
        $this->assertEquals($course1->id, $visibleCourses->first()->id);
        $this->assertEquals($tenant1->id, $visibleCourses->first()->tenant_id);

        // Limpar contexto e simular login do User 2 (Tenant 2)
        $tenantContextService->clearTenantContext();
        $this->actingAs($user2);
        $tenantContextService->setCurrentTenant($tenant2->id);

        // User 2 deve ver apenas seus dados
        $visibleCourses = Course::all();
        $this->assertCount(1, $visibleCourses);
        $this->assertEquals($course2->id, $visibleCourses->first()->id);
        $this->assertEquals($tenant2->id, $visibleCourses->first()->tenant_id);
    }

    /** @test */
    public function admin_dashboard_respects_tenant_isolation()
    {
        // Criar tenant e usuários
        $tenant = Tenant::create([
            'id' => 'test-tenant-uuid',
            'name' => 'Test Tenant',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
        ]);

        $student = User::create([
            'name' => 'Student',
            'email' => 'student@test.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'tenant_id' => $tenant->id,
        ]);

        // Criar usuário de outro tenant
        $otherTenant = Tenant::create([
            'id' => 'other-tenant-uuid',
            'name' => 'Other Tenant',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@other.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'tenant_id' => $otherTenant->id,
        ]);

        // Login como admin do primeiro tenant
        $this->actingAs($admin);

        $tenantContextService = app(TenantContextService::class);
        $tenantContextService->setCurrentTenant($tenant->id);

        // Admin deve ver apenas usuários do seu tenant
        $visibleUsers = User::all();
        $this->assertCount(2, $visibleUsers); // admin + student

        $emails = $visibleUsers->pluck('email')->toArray();
        $this->assertContains('admin@test.com', $emails);
        $this->assertContains('student@test.com', $emails);
        $this->assertNotContains('other@other.com', $emails);
    }

    /** @test */
    public function registration_always_includes_tenant_id()
    {
        $tenant = Tenant::create([
            'id' => 'registration-tenant-uuid',
            'name' => 'Test Tenant',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        // Simular contexto de tenant
        $tenantContextService = app(TenantContextService::class);
        $tenantContextService->setCurrentTenant($tenant->id);

        // Tentar criar usuário via RegisteredUserController
        $response = $this->post('/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Verificar que usuário foi criado com tenant_id correto
        $user = User::where('email', 'newuser@test.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals($tenant->id, $user->tenant_id);
    }

    /** @test */
    public function global_scope_prevents_data_leakage()
    {
        // Criar dois tenants com dados
        $tenant1 = Tenant::create([
            'id' => 'scope-tenant-1-uuid',
            'name' => 'Tenant 1',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        $tenant2 = Tenant::create([
            'id' => 'scope-tenant-2-uuid',
            'name' => 'Tenant 2',
            'status' => 'active',
            'is_active' => true,
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 1000,
            'plan' => 'basic'
        ]);

        // Criar usuários em tenants diferentes
        $user1 = User::create([
            'name' => 'User 1',
            'email' => 'user1@tenant1.com',
            'password' => bcrypt('password'),
            'tenant_id' => $tenant1->id,
        ]);

        $user2 = User::create([
            'name' => 'User 2',
            'email' => 'user2@tenant2.com',
            'password' => bcrypt('password'),
            'tenant_id' => $tenant2->id,
        ]);

        // Simular contexto sem tenant (deve retornar vazio por segurança)
        $tenantContextService = app(TenantContextService::class);
        $tenantContextService->clearTenantContext();

        $users = User::all();
        $this->assertCount(0, $users, 'Global scope deve retornar vazio quando não há contexto de tenant');

        // Simular contexto com tenant específico
        $tenantContextService->setCurrentTenant($tenant1->id);

        $users = User::all();
        $this->assertCount(1, $users);
        $this->assertEquals($user1->id, $users->first()->id);
    }
}