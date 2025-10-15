<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Buscar tenant escola-teste
$tenant = \App\Models\Tenant::where('slug', 'escola-teste')->first();

if (!$tenant) {
    echo 'Tenant escola-teste nao encontrado!\n';
    exit;
}

echo 'Criando usuarios para tenant: ' . $tenant->name . ' (ID: ' . $tenant->id . ')\n\n';

// Criar Professor
$professor = \App\Models\User::create([
    'name' => 'Prof. Maria Santos',
    'email' => 'maria@escola-teste.com',
    'password' => bcrypt('password'),
    'role' => 'instructor',
    'tenant_id' => $tenant->id,
    'email_verified_at' => now()
]);

echo 'Professor criado: ' . $professor->email . '\n';

// Criar Aluno
$aluno = \App\Models\User::create([
    'name' => 'Pedro Almeida',
    'email' => 'pedro@escola-teste.com',
    'password' => bcrypt('password'),
    'role' => 'student',
    'tenant_id' => $tenant->id,
    'email_verified_at' => now()
]);

echo 'Aluno criado: ' . $aluno->email . '\n';

echo '\nCredenciais para teste:\n';
echo '- Admin: admin@escola-teste.com / password\n';
echo '- Professor: maria@escola-teste.com / password\n';
echo '- Aluno: pedro@escola-teste.com / password\n';
?>
