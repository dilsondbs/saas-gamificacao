<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\GeminiDualBrainService;

echo "\n";
echo "===========================================\n";
echo "       TESTE DUAL-BRAIN GEMINI\n";
echo "===========================================\n\n";

// Verificar PDFs disponíveis
$pdfDir = storage_path('app/pdfs');
$pdfs = glob($pdfDir . '/*.pdf');

if (empty($pdfs)) {
    echo "❌ Nenhum PDF encontrado em: {$pdfDir}\n";
    echo "   Crie um PDF de teste neste diretório.\n\n";
    exit(1);
}

// Listar PDFs disponíveis
echo "📚 PDFs disponíveis:\n";
foreach ($pdfs as $index => $pdf) {
    echo "   " . ($index + 1) . ". " . basename($pdf) . "\n";
}

// Selecionar o primeiro PDF
$selectedPdf = $pdfs[0];
$pdfName = basename($selectedPdf);

echo "\n📄 Usando PDF: {$pdfName}\n";
echo "-------------------------------------------\n\n";

// Extrair conteúdo do PDF
try {
    $parser = new \Smalot\PdfParser\Parser();
    $pdf = $parser->parseFile($selectedPdf);
    $pdfContent = $pdf->getText();

    // Limpar e normalizar
    $pdfContent = preg_replace('/\s+/', ' ', $pdfContent);
    $pdfContent = trim($pdfContent);

    echo "📊 Informações do PDF:\n";
    echo "   Tamanho do arquivo: " . number_format(filesize($selectedPdf) / 1024, 2) . " KB\n";
    echo "   Caracteres extraídos: " . strlen($pdfContent) . "\n";
    echo "   Preview: " . substr($pdfContent, 0, 100) . "...\n\n";

} catch (\Exception $e) {
    echo "❌ Erro ao extrair conteúdo do PDF: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Título do curso
$courseTitle = "Noções de Direito para Militares";

echo "🎯 Título do curso: {$courseTitle}\n";
echo "-------------------------------------------\n\n";

// Instanciar serviço Dual Brain
$service = new GeminiDualBrainService();

// Iniciar cronômetro total
$startTotal = microtime(true);

// ===================================================
// ETAPA 1: ANÁLISE DO PDF
// ===================================================
echo "🧠 ETAPA 1: Análise PDF com Gemini 2.5 Flash...\n";
$startAnalysis = microtime(true);

$analysis = $service->analyzePDF($pdfContent);
$timeAnalysis = microtime(true) - $startAnalysis;

if (!$analysis) {
    echo "   ❌ Falha na análise\n";
    echo "   ⏱️  Tempo: " . number_format($timeAnalysis, 2) . "s\n\n";
    echo "❌ PROCESSO INTERROMPIDO\n";
    echo "===========================================\n\n";
    exit(1);
}

echo "   ✅ Sucesso\n";
echo "   📊 Topics: " . implode(', ', $analysis['topics']) . "\n";
echo "   📊 Difficulty: " . $analysis['difficulty'] . "\n";
echo "   ⏱️  Tempo: " . number_format($timeAnalysis, 2) . "s\n\n";

// ===================================================
// ETAPA 2: GERAÇÃO DO CURSO
// ===================================================
echo "🧠 ETAPA 2: Geração do Curso com Gemini 1.5 Pro...\n";
$startGeneration = microtime(true);

$courseData = $service->generateCourseFromAnalysis($analysis, $courseTitle);
$timeGeneration = microtime(true) - $startGeneration;

if (!$courseData) {
    echo "   ❌ Falha na geração\n";
    echo "   ⏱️  Tempo: " . number_format($timeGeneration, 2) . "s\n\n";
    echo "❌ PROCESSO INTERROMPIDO\n";
    echo "===========================================\n\n";
    exit(1);
}

// Contar lições
$totalLessons = 0;
foreach ($courseData['modules'] ?? [] as $module) {
    $totalLessons += count($module['lessons'] ?? []);
}

echo "   ✅ Sucesso\n";
echo "   📦 Módulos: " . count($courseData['modules'] ?? []) . "\n";
echo "   📝 Lições: " . $totalLessons . "\n";
echo "   ⏱️  Tempo: " . number_format($timeGeneration, 2) . "s\n\n";

// ===================================================
// RESUMO FINAL
// ===================================================
$timeTotal = microtime(true) - $startTotal;

echo "===========================================\n";
echo "✅ CURSO GERADO COM SUCESSO!\n";
echo "===========================================\n\n";

echo "📋 RESUMO DO CURSO:\n";
echo "-------------------------------------------\n";
echo "Título: " . ($courseData['title'] ?? 'N/A') . "\n";
echo "Descrição: " . substr($courseData['description'] ?? 'N/A', 0, 150) . "...\n";
echo "Dificuldade: " . ($courseData['difficulty'] ?? 'N/A') . "\n";
echo "Horas estimadas: " . ($courseData['estimated_hours'] ?? 'N/A') . "h\n";
echo "Pontos: " . ($courseData['points_per_completion'] ?? 'N/A') . "\n\n";

echo "📚 ESTRUTURA:\n";
echo "-------------------------------------------\n";
foreach ($courseData['modules'] ?? [] as $index => $module) {
    echo "Módulo " . ($index + 1) . ": " . ($module['title'] ?? 'N/A') . "\n";
    echo "  └─ " . count($module['lessons'] ?? []) . " lições\n";

    // Mostrar primeiras 2 lições
    $lessons = array_slice($module['lessons'] ?? [], 0, 2);
    foreach ($lessons as $lIndex => $lesson) {
        echo "     └─ Lição " . ($lIndex + 1) . ": " . ($lesson['title'] ?? 'N/A') . "\n";
    }

    if (count($module['lessons'] ?? []) > 2) {
        echo "     └─ ... e " . (count($module['lessons']) - 2) . " mais\n";
    }
    echo "\n";
}

echo "⏱️  PERFORMANCE:\n";
echo "-------------------------------------------\n";
echo "Análise PDF (2.5 Flash):  " . number_format($timeAnalysis, 2) . "s\n";
echo "Geração Curso (1.5 Pro):  " . number_format($timeGeneration, 2) . "s\n";
echo "Tempo Total:              " . number_format($timeTotal, 2) . "s\n\n";

echo "💾 DADOS COMPLETOS (JSON):\n";
echo "-------------------------------------------\n";
echo json_encode($courseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "===========================================\n";
echo "           FIM DO TESTE\n";
echo "===========================================\n\n";
