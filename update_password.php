<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::where('email', 'admin@escola-teste.com')->first();
if ($user) {
    $user->password = bcrypt('password');
    $user->save();
    echo 'Senha atualizada para: password\n';
} else {
    echo 'Usuario nao encontrado\n';
}
?>
