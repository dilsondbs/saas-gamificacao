<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== VERIFICANDO SCHEMA DO TENANT ===\n";

$tenant = Tenant::where('slug', 'empresa-teste')->first();
tenancy()->initialize($tenant);

echo "Database: " . DB::connection()->getDatabaseName() . "\n\n";

$tables = DB::select('SHOW TABLES');
echo "=== TABELAS EXISTENTES ===\n";
foreach ($tables as $table) {
    $tableName = array_values((array) $table)[0];
    echo "✓ {$tableName}\n";
}

echo "\n=== VERIFICANDO TABELAS ESPECÍFICAS ===\n";
$requiredTables = [
    'users', 'courses', 'activities', 'badges', 
    'user_activities', 'user_badges', 'user_courses', 'course_materials'
];

foreach ($requiredTables as $table) {
    if (Schema::hasTable($table)) {
        echo "✅ {$table} - EXISTS\n";
    } else {
        echo "❌ {$table} - NOT FOUND\n";
    }
}

tenancy()->end();