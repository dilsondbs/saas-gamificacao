<?php

/**
 * ═══════════════════════════════════════════════════════════════════
 * TESTE COMPARATIVO: OPENAI GPT-4o vs GEMINI 2.5 FLASH
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este script gera o mesmo curso usando ambos provedores e compara:
 * - Tempo de geração
 * - Custo (USD)
 * - Confiança (confidence score)
 * - Qualidade do conteúdo
 * - Estrutura (módulos, lições, atividades)
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\UploadedFile;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "╔═══════════════════════════════════════════════════════════════════════╗\n";
echo "║         🔬 TESTE COMPARATIVO: OPENAI vs GEMINI                       ║\n";
echo "╔═══════════════════════════════════════════════════════════════════════╗\n";
echo "\n";

// ═══════════════════════════════════════════════════════════════════
// ETAPA 1: Verificar se FastAPI está rodando
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ ETAPA 1: Verificando FastAPI                                       │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

try {
    $healthCheck = @file_get_contents('http://localhost:8001/health');
    if (!$healthCheck) {
        throw new Exception("FastAPI não está acessível");
    }

    $health = json_decode($healthCheck, true);

    if (!isset($health['providers']['openai']) || $health['providers']['openai'] !== 'available') {
        echo "❌ OpenAI não está disponível\n";
        exit(1);
    }

    if (!isset($health['providers']['gemini']) || $health['providers']['gemini'] !== 'available') {
        echo "❌ Gemini não está disponível\n";
        exit(1);
    }

    echo "✅ FastAPI rodando e saudável\n";
    echo "✅ OpenAI disponível\n";
    echo "✅ Gemini disponível\n\n";

} catch (Exception $e) {
    echo "❌ ERRO: FastAPI não está rodando\n";
    echo "💡 Execute: cd eduai-ai-service && uvicorn app.main:app --reload --port 8001\n";
    exit(1);
}

// ═══════════════════════════════════════════════════════════════════
// ETAPA 2: Criar PDF de teste
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ ETAPA 2: Criando PDF de teste                                      │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

$testPdfContent = "%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources 5 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >> endobj
4 0 obj << /Type /Page /Parent 2 0 R /Resources 5 0 R /MediaBox [0 0 612 792] /Contents 7 0 R >> endobj
5 0 obj << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> endobj
6 0 obj << /Length 450 >> stream
BT
/F1 16 Tf
50 750 Td
(Introducao ao Python para Data Science) Tj
0 -30 Td
/F1 12 Tf
(Python e uma linguagem de programacao versátil e poderosa,) Tj
0 -20 Td
(amplamente utilizada em ciencia de dados, machine learning e) Tj
0 -20 Td
(análise de dados. Este curso aborda os fundamentos essenciais.) Tj
0 -40 Td
/F1 14 Tf
(Modulo 1: Fundamentos de Python) Tj
0 -30 Td
/F1 12 Tf
(- Variáveis e tipos de dados) Tj
0 -20 Td
(- Estruturas de controle (if, for, while)) Tj
0 -20 Td
(- Funcoes e modulos) Tj
0 -20 Td
(- Listas, tuplas e dicionários) Tj
ET
endstream endobj
7 0 obj << /Length 400 >> stream
BT
/F1 14 Tf
50 750 Td
(Modulo 2: Bibliotecas para Data Science) Tj
0 -30 Td
/F1 12 Tf
(NumPy: Computacao numérica e arrays multidimensionais) Tj
0 -20 Td
(Pandas: Manipulacao e análise de dados tabulares) Tj
0 -20 Td
(Matplotlib: Visualizacao de dados) Tj
0 -40 Td
/F1 14 Tf
(Modulo 3: Projetos Práticos) Tj
0 -30 Td
/F1 12 Tf
(- Análise exploratória de dados (EDA)) Tj
0 -20 Td
(- Limpeza e preparacao de dados) Tj
0 -20 Td
(- Visualizacao de padroes e tendencias) Tj
0 -20 Td
(- Mini-projeto: Dashboard interativo) Tj
ET
endstream endobj
xref
0 8
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000122 00000 n
0000000237 00000 n
0000000352 00000 n
0000000451 00000 n
0000000954 00000 n
trailer << /Size 8 /Root 1 0 R >>
startxref
1408
%%EOF";

$testPdfPath = storage_path('app/test_comparison.pdf');
file_put_contents($testPdfPath, $testPdfContent);

$uploadedFile = new UploadedFile(
    $testPdfPath,
    'test_comparison.pdf',
    'application/pdf',
    null,
    true
);

echo "✅ PDF de teste criado (Python Data Science)\n";
echo "   Tamanho: " . strlen($testPdfContent) . " bytes\n";
echo "   Conteúdo: 3 módulos sobre Python e Data Science\n\n";

// ═══════════════════════════════════════════════════════════════════
// ETAPA 3: Testar com OPENAI
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ ETAPA 3: Gerando curso com OPENAI GPT-4o                           │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

$pythonService = app(\App\Services\PythonAIService::class);

$startTimeOpenAI = microtime(true);
try {
    $resultOpenAI = $pythonService->generateCourseFromPDF(
        $uploadedFile,
        'Python para Data Science',
        'intermediate',
        'Estudantes de TI e Ciência de Dados',
        true, // premium_quality = true
        'openai' // force provider
    );
    $timeOpenAI = microtime(true) - $startTimeOpenAI;

    if (!isset($resultOpenAI['success']) || !$resultOpenAI['success']) {
        throw new Exception("OpenAI retornou erro: " . json_encode($resultOpenAI));
    }

    echo "✅ Curso gerado com sucesso!\n";
    echo "   ⏱️  Tempo: " . number_format($timeOpenAI, 2) . "s\n";
    echo "   🤖 Provider: " . ($resultOpenAI['metadata']['provider'] ?? 'N/A') . "\n";
    echo "   🧠 Model: " . ($resultOpenAI['metadata']['model'] ?? 'N/A') . "\n";
    echo "   💰 Custo: $" . number_format($resultOpenAI['metadata']['cost_usd'] ?? 0, 4) . "\n";
    echo "   📈 Confiança: " . number_format(($resultOpenAI['metadata']['confidence_score'] ?? 0) * 100, 1) . "%\n";
    echo "   📚 Módulos: " . count($resultOpenAI['course_data']['modules'] ?? []) . "\n";

    // Contar lições
    $lessonsOpenAI = 0;
    foreach (($resultOpenAI['course_data']['modules'] ?? []) as $module) {
        $lessonsOpenAI += count($module['lessons'] ?? []);
    }
    echo "   📖 Lições: $lessonsOpenAI\n\n";

} catch (Exception $e) {
    echo "❌ ERRO ao gerar com OpenAI: " . $e->getMessage() . "\n";
    unlink($testPdfPath);
    exit(1);
}

// Salvar resultado OpenAI
$openaiResultPath = storage_path('app/openai_result.json');
file_put_contents($openaiResultPath, json_encode($resultOpenAI, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "💾 Resultado salvo em: $openaiResultPath\n\n";

// Recriar arquivo para segundo teste
$uploadedFile = new UploadedFile(
    $testPdfPath,
    'test_comparison.pdf',
    'application/pdf',
    null,
    true
);

// ═══════════════════════════════════════════════════════════════════
// ETAPA 4: Testar com GEMINI
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ ETAPA 4: Gerando curso com GEMINI 2.5 Flash                        │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

$startTimeGemini = microtime(true);
try {
    $resultGemini = $pythonService->generateCourseFromPDF(
        $uploadedFile,
        'Python para Data Science',
        'intermediate',
        'Estudantes de TI e Ciência de Dados',
        false, // premium_quality = false
        'gemini' // force provider
    );
    $timeGemini = microtime(true) - $startTimeGemini;

    if (!isset($resultGemini['success']) || !$resultGemini['success']) {
        throw new Exception("Gemini retornou erro: " . json_encode($resultGemini));
    }

    echo "✅ Curso gerado com sucesso!\n";
    echo "   ⏱️  Tempo: " . number_format($timeGemini, 2) . "s\n";
    echo "   🤖 Provider: " . ($resultGemini['metadata']['provider'] ?? 'N/A') . "\n";
    echo "   🧠 Model: " . ($resultGemini['metadata']['model'] ?? 'N/A') . "\n";
    echo "   💰 Custo: $" . number_format($resultGemini['metadata']['cost_usd'] ?? 0, 4) . "\n";
    echo "   📈 Confiança: " . number_format(($resultGemini['metadata']['confidence_score'] ?? 0) * 100, 1) . "%\n";
    echo "   📚 Módulos: " . count($resultGemini['course_data']['modules'] ?? []) . "\n";

    // Contar lições
    $lessonsGemini = 0;
    foreach (($resultGemini['course_data']['modules'] ?? []) as $module) {
        $lessonsGemini += count($module['lessons'] ?? []);
    }
    echo "   📖 Lições: $lessonsGemini\n\n";

} catch (Exception $e) {
    echo "❌ ERRO ao gerar com Gemini: " . $e->getMessage() . "\n";
    unlink($testPdfPath);
    exit(1);
}

// Salvar resultado Gemini
$geminiResultPath = storage_path('app/gemini_result.json');
file_put_contents($geminiResultPath, json_encode($resultGemini, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "💾 Resultado salvo em: $geminiResultPath\n\n";

// ═══════════════════════════════════════════════════════════════════
// ETAPA 5: ANÁLISE COMPARATIVA
// ═══════════════════════════════════════════════════════════════════
echo "\n";
echo "╔═══════════════════════════════════════════════════════════════════════╗\n";
echo "║                      📊 ANÁLISE COMPARATIVA                           ║\n";
echo "╚═══════════════════════════════════════════════════════════════════════╝\n";
echo "\n";

// Tabela de comparação
echo "┌─────────────────────────┬──────────────────┬──────────────────┐\n";
echo "│ MÉTRICA                 │ OPENAI GPT-4o    │ GEMINI 2.5 Flash │\n";
echo "├─────────────────────────┼──────────────────┼──────────────────┤\n";

// Tempo
printf("│ ⏱️  Tempo de Geração    │ %13.2fs │ %13.2fs │\n", $timeOpenAI, $timeGemini);

// Custo
printf("│ 💰 Custo (USD)          │ $%15.4f │ $%15.4f │\n",
    $resultOpenAI['metadata']['cost_usd'] ?? 0,
    $resultGemini['metadata']['cost_usd'] ?? 0
);

// Confiança
printf("│ 📈 Confiança            │ %14.1f%% │ %14.1f%% │\n",
    ($resultOpenAI['metadata']['confidence_score'] ?? 0) * 100,
    ($resultGemini['metadata']['confidence_score'] ?? 0) * 100
);

// Módulos
printf("│ 📚 Número de Módulos    │ %16d │ %16d │\n",
    count($resultOpenAI['course_data']['modules'] ?? []),
    count($resultGemini['course_data']['modules'] ?? [])
);

// Lições
printf("│ 📖 Total de Lições      │ %16d │ %16d │\n", $lessonsOpenAI, $lessonsGemini);

echo "└─────────────────────────┴──────────────────┴──────────────────┘\n";
echo "\n";

// ═══════════════════════════════════════════════════════════════════
// ANÁLISE DE VELOCIDADE
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ 🏃 ANÁLISE DE VELOCIDADE                                            │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

if ($timeGemini < $timeOpenAI) {
    $speedup = ($timeOpenAI / $timeGemini - 1) * 100;
    echo "🏆 GEMINI é mais rápido: " . number_format($speedup, 1) . "% mais rápido\n";
    echo "   Diferença: " . number_format($timeOpenAI - $timeGemini, 2) . "s\n\n";
} else {
    $speedup = ($timeGemini / $timeOpenAI - 1) * 100;
    echo "🏆 OPENAI é mais rápido: " . number_format($speedup, 1) . "% mais rápido\n";
    echo "   Diferença: " . number_format($timeGemini - $timeOpenAI, 2) . "s\n\n";
}

// ═══════════════════════════════════════════════════════════════════
// ANÁLISE DE CUSTO
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ 💰 ANÁLISE DE CUSTO                                                 │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

$costOpenAI = $resultOpenAI['metadata']['cost_usd'] ?? 0;
$costGemini = $resultGemini['metadata']['cost_usd'] ?? 0;

if ($costGemini < $costOpenAI) {
    $savings = (($costOpenAI - $costGemini) / $costOpenAI) * 100;
    echo "🏆 GEMINI é mais barato: " . number_format($savings, 1) . "% mais econômico\n";
    echo "   Economia por curso: $" . number_format($costOpenAI - $costGemini, 6) . "\n";
    echo "   Em 1000 cursos: $" . number_format(($costOpenAI - $costGemini) * 1000, 2) . "\n\n";
} else {
    $savings = (($costGemini - $costOpenAI) / $costGemini) * 100;
    echo "🏆 OPENAI é mais barato: " . number_format($savings, 1) . "% mais econômico\n";
    echo "   Economia por curso: $" . number_format($costGemini - $costOpenAI, 6) . "\n";
    echo "   Em 1000 cursos: $" . number_format(($costGemini - $costOpenAI) * 1000, 2) . "\n\n";
}

// ═══════════════════════════════════════════════════════════════════
// ANÁLISE DE QUALIDADE
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ 🎯 ANÁLISE DE QUALIDADE                                             │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

$confOpenAI = ($resultOpenAI['metadata']['confidence_score'] ?? 0) * 100;
$confGemini = ($resultGemini['metadata']['confidence_score'] ?? 0) * 100;

echo "OpenAI GPT-4o:\n";
echo "   Confiança: " . number_format($confOpenAI, 1) . "%\n";
echo "   Módulos: " . count($resultOpenAI['course_data']['modules'] ?? []) . "\n";
echo "   Lições: $lessonsOpenAI\n";
echo "   Avaliação: " . ($confOpenAI >= 90 ? "⭐⭐⭐⭐⭐ Excelente" : ($confOpenAI >= 80 ? "⭐⭐⭐⭐ Muito Bom" : "⭐⭐⭐ Bom")) . "\n\n";

echo "Gemini 2.5 Flash:\n";
echo "   Confiança: " . number_format($confGemini, 1) . "%\n";
echo "   Módulos: " . count($resultGemini['course_data']['modules'] ?? []) . "\n";
echo "   Lições: $lessonsGemini\n";
echo "   Avaliação: " . ($confGemini >= 90 ? "⭐⭐⭐⭐⭐ Excelente" : ($confGemini >= 80 ? "⭐⭐⭐⭐ Muito Bom" : "⭐⭐⭐ Bom")) . "\n\n";

// ═══════════════════════════════════════════════════════════════════
// RECOMENDAÇÕES
// ═══════════════════════════════════════════════════════════════════
echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ 💡 RECOMENDAÇÕES                                                    │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n\n";

// Calcular score ponderado
$scoreOpenAI = ($confOpenAI * 0.5) + ((1 - $costOpenAI) * 50 * 0.3) + ((20 - $timeOpenAI) * 2 * 0.2);
$scoreGemini = ($confGemini * 0.5) + ((1 - $costGemini) * 50 * 0.3) + ((20 - $timeGemini) * 2 * 0.2);

echo "Score Geral (ponderado):\n";
echo "   OpenAI:  " . number_format($scoreOpenAI, 1) . " pontos\n";
echo "   Gemini:  " . number_format($scoreGemini, 1) . " pontos\n\n";

echo "Quando usar OPENAI GPT-4o:\n";
echo "   ✅ Cursos premium com alta complexidade\n";
echo "   ✅ Conteúdo técnico avançado\n";
echo "   ✅ Quando qualidade é prioridade absoluta\n";
echo "   ✅ Clientes pagantes com planos premium\n\n";

echo "Quando usar GEMINI 2.5 Flash:\n";
echo "   ✅ Geração em massa de cursos\n";
echo "   ✅ Conteúdo introdutório/intermediário\n";
echo "   ✅ Quando custo é fator importante\n";
echo "   ✅ Prototipagem rápida\n";
echo "   ✅ Versões gratuitas ou planos básicos\n\n";

// ═══════════════════════════════════════════════════════════════════
// VISUALIZAÇÃO DE CONTEÚDO
// ═══════════════════════════════════════════════════════════════════
echo "\n";
echo "╔═══════════════════════════════════════════════════════════════════════╗\n";
echo "║                  📝 AMOSTRA DE CONTEÚDO GERADO                        ║\n";
echo "╚═══════════════════════════════════════════════════════════════════════╝\n";
echo "\n";

echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ OPENAI GPT-4o - Primeiro Módulo                                    │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n";
if (isset($resultOpenAI['course_data']['modules'][0])) {
    $module = $resultOpenAI['course_data']['modules'][0];
    echo "📚 " . ($module['title'] ?? 'N/A') . "\n";
    echo "📝 " . substr($module['description'] ?? 'N/A', 0, 150) . "...\n";
    echo "📖 Lições: " . count($module['lessons'] ?? []) . "\n\n";
}

echo "┌─────────────────────────────────────────────────────────────────────┐\n";
echo "│ GEMINI 2.5 Flash - Primeiro Módulo                                 │\n";
echo "└─────────────────────────────────────────────────────────────────────┘\n";
if (isset($resultGemini['course_data']['modules'][0])) {
    $module = $resultGemini['course_data']['modules'][0];
    echo "📚 " . ($module['title'] ?? 'N/A') . "\n";
    echo "📝 " . substr($module['description'] ?? 'N/A', 0, 150) . "...\n";
    echo "📖 Lições: " . count($module['lessons'] ?? []) . "\n\n";
}

// ═══════════════════════════════════════════════════════════════════
// CONCLUSÃO
// ═══════════════════════════════════════════════════════════════════
echo "\n";
echo "╔═══════════════════════════════════════════════════════════════════════╗\n";
echo "║                        ✅ TESTE CONCLUÍDO                             ║\n";
echo "╚═══════════════════════════════════════════════════════════════════════╝\n";
echo "\n";

echo "📁 Resultados salvos em:\n";
echo "   • $openaiResultPath\n";
echo "   • $geminiResultPath\n\n";

echo "📊 Resumo:\n";
if ($scoreOpenAI > $scoreGemini) {
    echo "   🏆 OpenAI GPT-4o teve melhor performance geral\n";
    echo "   📈 Recomendado para: cursos premium e conteúdo avançado\n";
} else {
    echo "   🏆 Gemini 2.5 Flash teve melhor performance geral\n";
    echo "   📈 Recomendado para: geração em massa e custo-benefício\n";
}

echo "\n💡 Estratégia sugerida: Use o AI Router (modo 'auto') para selecionar\n";
echo "   automaticamente o melhor provider baseado no contexto\n\n";

// Limpar arquivo de teste
unlink($testPdfPath);

exit(0);
