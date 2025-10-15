<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo '=== TENANTS E USUARIOS ===\n\n';

foreach (\App\Models\Tenant::all() as $tenant) {
    echo 'Tenant: ' . $tenant->name . ' (' . $tenant->slug . ')\n';
    echo 'ID: ' . $tenant->id . '\n';

    $users = \App\Models\User::where('tenant_id', $tenant->id)->get();

    if ($users->count() > 0) {
        echo 'Usuarios:\n';
        foreach ($users as $user) {
            echo '  - ' . $user->email . ' (' . $user->role . ')\n';
        }
    } else {
        echo '  Nenhum usuario encontrado.\n';
    }

    echo '\n';
}
?>
