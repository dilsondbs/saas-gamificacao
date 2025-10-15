<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "═══════════════════════════════════════════════════════════════\n";
echo "📊 VERIFICAR TABELAS user_activities\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$tables = DB::select('SHOW TABLES');

foreach ($tables as $table) {
    $tableName = array_values((array)$table)[0];
    if (strpos($tableName, 'user_activities') !== false) {
        echo "✅ Tabela encontrada: {$tableName}\n";

        // Contar registros
        $count = DB::table($tableName)->count();
        echo "   Registros: {$count}\n";

        // Verificar colunas
        $columns = DB::select("DESCRIBE {$tableName}");
        echo "   Colunas: ";
        $colNames = array_map(function($col) { return $col->Field; }, $columns);
        echo implode(', ', $colNames) . "\n\n";
    }
}
