<?php

// Script para testar consulta User diretamente
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TESTE DE CONSULTA USER ===\n";

try {
    echo "1. Testando configuração atual:\n";
    echo "Default connection: " . config('database.default') . "\n";
    echo "MySQL database: " . config('database.connections.mysql.database') . "\n";
    echo "Central database: " . config('database.connections.central.database') . "\n";

    echo "\n2. Testando conexões diretas:\n";
    $mysql = DB::connection('mysql');
    echo "MySQL real database: " . $mysql->getDatabaseName() . "\n";

    $central = DB::connection('central');
    echo "Central real database: " . $central->getDatabaseName() . "\n";

    echo "\n3. Testando consulta direta no MySQL:\n";
    $users = DB::connection('mysql')->table('users')->where('email', 'admin@saas-gamificacao.com')->get();
    echo "Usuários encontrados via MySQL: " . $users->count() . "\n";

    echo "\n4. Testando consulta direta no Central:\n";
    $users = DB::connection('central')->table('users')->where('email', 'admin@saas-gamificacao.com')->get();
    echo "Usuários encontrados via Central: " . $users->count() . "\n";

    echo "\n5. Testando modelo User (AQUI PODE FALHAR):\n";
    $user = App\Models\User::where('email', 'admin@saas-gamificacao.com')->first();
    echo "User encontrado via modelo: " . ($user ? $user->name : 'ERRO') . "\n";

} catch(Exception $e) {
    echo "\nERRO CAPTURADO: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== FIM DO TESTE ===\n";