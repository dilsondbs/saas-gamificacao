<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed APENAS o super admin central (sem popular nada mais)
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => 'Super Admin',
            'email' => 'admin@vemcomigoja.local',
            'password' => Hash::make('Admin@2025'),
            'role' => 'admin',
            'total_points' => 0,
            'tenant_id' => null, // Usuário central, não pertence a nenhum tenant
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
