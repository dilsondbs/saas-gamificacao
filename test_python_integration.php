<?php

/**
 * Script de teste de integração Laravel -> FastAPI
 *
 * Este script testa se a comunicação entre Laravel e o microserviço Python está funcionando
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   TESTE DE INTEGRAÇÃO LARAVEL -> FASTAPI                    ║\n";
echo "╔══════════════════════════════════════════════════════════════╗\n\n";

// 1. Verificar se FastAPI está rodando
echo "1️⃣  Verificando se FastAPI está rodando...\n";
try {
    $healthCheck = file_get_contents('http://localhost:8001/health');
    $health = json_decode($healthCheck, true);

    if ($health && $health['status'] === 'healthy') {
        echo "   ✅ FastAPI está rodando!\n";
        echo "   📊 Providers disponíveis:\n";
        foreach ($health['providers'] as $provider => $status) {
            $icon = $status === 'available' ? '✅' : '❌';
            echo "      $icon $provider: $status\n";
        }
    } else {
        echo "   ❌ FastAPI retornou status inesperado\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ❌ FastAPI não está acessível: " . $e->getMessage() . "\n";
    echo "   💡 Execute: cd eduai-ai-service && uvicorn app.main:app --reload --port 8001\n";
    exit(1);
}

echo "\n2️⃣  Verificando configuração do Laravel...\n";
$pythonUrl = env('PYTHON_AI_SERVICE_URL');
if ($pythonUrl) {
    echo "   ✅ PYTHON_AI_SERVICE_URL configurada: $pythonUrl\n";
} else {
    echo "   ❌ PYTHON_AI_SERVICE_URL não configurada no .env\n";
    exit(1);
}

echo "\n3️⃣  Testando PythonAIService...\n";

// Criar um PDF de teste
$testPdfContent = "%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj
4 0 obj << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> endobj
5 0 obj << /Length 100 >> stream
BT
/F1 12 Tf
100 700 Td
(Teste de Integracao Laravel -> FastAPI) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000230 00000 n
0000000329 00000 n
trailer << /Size 6 /Root 1 0 R >>
startxref
479
%%EOF";

$testPdfPath = storage_path('app/test_integration.pdf');
file_put_contents($testPdfPath, $testPdfContent);

// Criar UploadedFile simulado
$uploadedFile = new UploadedFile(
    $testPdfPath,
    'test_integration.pdf',
    'application/pdf',
    null,
    true
);

echo "   📄 PDF de teste criado: $testPdfPath\n";

// Testar PythonAIService
$pythonService = app(\App\Services\PythonAIService::class);

echo "   🚀 Chamando PythonAIService...\n";

try {
    $result = $pythonService->generateCourseFromPDF(
        $uploadedFile,
        'Curso de Teste de Integração',
        'intermediate',
        'Estudantes de TI',
        false
    );

    echo "   ✅ Requisição bem-sucedida!\n\n";
    echo "4️⃣  Analisando resposta...\n";

    if (isset($result['success']) && $result['success']) {
        echo "   ✅ Status: success = true\n";

        if (isset($result['course_data'])) {
            echo "   ✅ course_data presente\n";
            echo "      📖 Título: " . ($result['course_data']['title'] ?? 'N/A') . "\n";
            echo "      📊 Módulos: " . count($result['course_data']['modules'] ?? []) . "\n";
        }

        if (isset($result['metadata'])) {
            echo "   ✅ metadata presente\n";
            echo "      🤖 Provider: " . ($result['metadata']['provider'] ?? 'N/A') . "\n";
            echo "      🧠 Model: " . ($result['metadata']['model'] ?? 'N/A') . "\n";
            echo "      💰 Custo: $" . ($result['metadata']['cost_usd'] ?? 0) . "\n";
            echo "      📈 Confiança: " . (($result['metadata']['confidence_score'] ?? 0) * 100) . "%\n";
        }

        echo "\n╔══════════════════════════════════════════════════════════════╗\n";
        echo "║                 ✅ TESTE CONCLUÍDO COM SUCESSO!              ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n\n";

        echo "📋 Resultado completo (JSON):\n";
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

    } else {
        echo "   ❌ Resposta indica falha\n";
        echo "   📋 Detalhes: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "   ❌ Erro ao chamar PythonAIService: " . $e->getMessage() . "\n";
    echo "   📋 Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

// Limpar arquivo de teste
unlink($testPdfPath);
echo "🧹 Arquivo de teste removido\n";

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║           INTEGRAÇÃO LARAVEL ↔ FASTAPI FUNCIONANDO!         ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n";

exit(0);
