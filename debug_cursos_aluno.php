<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🔍 DEBUG: Por que aluno não vê os cursos?                 ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$tenant = \App\Models\Tenant::where('slug', 'vemcomigoja5')->first();
$aluno = \App\Models\User::where('email', 'aluno@vemcomigoja5.com')->first();

echo "🏢 Tenant: {$tenant->name} (ID: {$tenant->id})\n";
echo "👤 Aluno: {$aluno->name} (ID: {$aluno->id}, Tenant: {$aluno->tenant_id})\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "1️⃣  TODOS OS CURSOS NO BANCO (sem global scope):\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$allCourses = \App\Models\Course::withoutGlobalScopes()->get();

if ($allCourses->count() > 0) {
    foreach ($allCourses as $course) {
        echo "• {$course->title}\n";
        echo "  ID: {$course->id}\n";
        echo "  Tenant ID: " . ($course->tenant_id ?? 'NULL') . "\n";
        echo "  Status: " . ($course->status ?? 'NULL') . "\n";

        // Verificar se tem is_published
        try {
            $published = $course->is_published ?? 'campo não existe';
            echo "  is_published: " . ($published === 'campo não existe' ? 'campo não existe' : ($published ? 'true' : 'false')) . "\n";
        } catch (\Exception $e) {
            echo "  is_published: erro ao verificar\n";
        }

        echo "\n";
    }
} else {
    echo "⚠️  Nenhum curso no banco!\n\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "2️⃣  CURSOS DO TENANT (com global scope):\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Simular a query que o controller faz
$tenantCourses = \App\Models\Course::where('tenant_id', $tenant->id)->get();

echo "Total: {$tenantCourses->count()} curso(s)\n\n";

if ($tenantCourses->count() > 0) {
    foreach ($tenantCourses as $course) {
        echo "• {$course->title}\n";
        echo "  ID: {$course->id}\n";
        echo "  Status: " . ($course->status ?? 'NULL') . "\n";
        echo "\n";
    }
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "3️⃣  CURSOS PUBLICADOS (status='published'):\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$publishedCourses = \App\Models\Course::where('tenant_id', $tenant->id)
    ->where('status', 'published')
    ->get();

echo "Total: {$publishedCourses->count()} curso(s)\n\n";

if ($publishedCourses->count() > 0) {
    foreach ($publishedCourses as $course) {
        echo "• {$course->title} (ID: {$course->id})\n";
    }
} else {
    echo "⚠️  PROBLEMA IDENTIFICADO: Nenhum curso com status='published'\n\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "4️⃣  ESTRUTURA DA TABELA courses:\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$columns = \DB::select("DESCRIBE courses");
echo "Colunas da tabela:\n";
foreach ($columns as $col) {
    echo "  • {$col->Field} ({$col->Type})\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "💡 DIAGNÓSTICO:\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

if ($allCourses->count() == 0) {
    echo "❌ Nenhum curso foi salvo no banco de dados\n";
    echo "   Solução: Gere um novo curso com IA\n";
} elseif ($tenantCourses->count() == 0) {
    echo "❌ Cursos existem mas não estão associados ao tenant\n";
    echo "   Solução: tenant_id não foi salvo corretamente\n";
} elseif ($publishedCourses->count() == 0) {
    echo "❌ Cursos existem no tenant mas status != 'published'\n";
    echo "   Solução: Verificar qual status está sendo salvo\n";
    echo "   Status encontrado: " . ($allCourses->first()->status ?? 'NULL') . "\n";
} else {
    echo "✅ Tudo OK! Cursos disponíveis\n";
}

echo "\n";