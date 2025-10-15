<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MinimalTestSeeder extends Seeder
{
    /**
     * Seeder mínimo para teste do fluxo completo
     */
    public function run(): void
    {
        // 1. CRIAR EMPRESA/ESCOLA
        $tenant = Tenant::create([
            'id' => 'escola-teste',
            'name' => 'Escola Teste',
            'slug' => 'escola-teste',
            'description' => 'Escola para testes do sistema completo',
            'plan' => 'premium',
            'max_users' => 100,
            'max_courses' => 50,
            'max_storage_mb' => 5000,
            'is_active' => true,
            'trial_ends_at' => now()->addDays(30),
            'subscription_ends_at' => now()->addYear(),
        ]);

        echo "✅ Tenant criado: {$tenant->name} (ID: {$tenant->id})\n";

        // 2. CRIAR USUÁRIOS (APENAS 3)

        // Admin do Tenant - quem comprou/gerencia
        $admin = User::create([
            'name' => 'Admin Escola',
            'email' => 'admin@escola.com',
            'password' => Hash::make('senha123'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        // Professor - quem vai usar EduAI
        $professor = User::create([
            'name' => 'Professor Teste',
            'email' => 'professor@escola.com',
            'password' => Hash::make('senha123'),
            'role' => 'instructor',
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        // Aluno - quem vai estudar
        $aluno = User::create([
            'name' => 'Aluno Teste',
            'email' => 'aluno@escola.com',
            'password' => Hash::make('senha123'),
            'role' => 'student',
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        echo "✅ Usuários criados:\n";
        echo "   👑 Admin: admin@escola.com / senha123\n";
        echo "   👨‍🏫 Professor: professor@escola.com / senha123\n";
        echo "   👨‍🎓 Aluno: aluno@escola.com / senha123\n";

        echo "\n🎯 SEEDER MÍNIMO CONCLUÍDO!\n";
        echo "📋 Sistema pronto para teste do fluxo completo\n";
        echo "🔗 Acesse: http://127.0.0.1:8000/login\n\n";
    }
}