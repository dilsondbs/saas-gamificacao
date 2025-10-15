<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Testando conexão de banco...\n";

    // Testar configuração
    echo "Config default: " . config('database.default') . "\n";
    echo "Config mysql database: " . config('database.connections.mysql.database') . "\n";
    echo "Config central database: " . config('database.connections.central.database') . "\n";

    // Testar conexão direta
    $connection = DB::connection('mysql');
    echo "Conexão mysql database name: " . $connection->getDatabaseName() . "\n";

    // Testar modelo User
    echo "Testando modelo User...\n";
    echo "Total users: " . App\Models\User::count() . "\n";

    $user = App\Models\User::where('email', 'admin@saas-gamificacao.com')->first();
    echo "Admin encontrado: " . ($user ? $user->name : 'não encontrado') . "\n";

    // Listar alguns usuários
    $users = App\Models\User::limit(5)->get(['email', 'name']);
    echo "Usuários encontrados:\n";
    foreach($users as $u) {
        echo "- " . $u->email . " (" . $u->name . ")\n";
    }

} catch(Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    echo "Tipo: " . get_class($e) . "\n";
    if ($e instanceof PDOException) {
        echo "PDO Error Info: " . print_r($e->errorInfo, true) . "\n";
    }
}