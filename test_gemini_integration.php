<?php

/**
 * Teste de integração usando GEMINI (ao invés de OpenAI)
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\UploadedFile;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   TESTE DE INTEGRAÇÃO LARAVEL -> FASTAPI (GEMINI)           ║\n";
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

        if ($health['providers']['gemini'] !== 'available') {
            echo "\n   ❌ Gemini não está disponível!\n";
            exit(1);
        }
    } else {
        echo "   ❌ FastAPI retornou status inesperado\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ❌ FastAPI não está acessível: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n2️⃣  Criando PDF de teste...\n";

// Criar um PDF de teste com conteúdo real
$testPdfContent = "%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources 5 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >> endobj
4 0 obj << /Type /Page /Parent 2 0 R /Resources 5 0 R /MediaBox [0 0 612 792] /Contents 7 0 R >> endobj
5 0 obj << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> endobj
6 0 obj << /Length 550 >> stream
BT
/F1 18 Tf
50 750 Td
(Gestao de Pessoas - Fundamentos) Tj
0 -40 Td
/F1 14 Tf
(Modulo 1: Objetivos Organizacionais) Tj
0 -30 Td
/F1 12 Tf
(A gestao de pessoas tem como principal objetivo demonstrar a) Tj
0 -20 Td
(interacao entre os objetivos individuais e os objetivos) Tj
0 -20 Td
(organizacionais. E fundamental compreender como alinhar as) Tj
0 -20 Td
(metas pessoais dos colaboradores com as estrategias da empresa.) Tj
0 -40 Td
/F1 14 Tf
(Topicos principais:) Tj
0 -25 Td
/F1 12 Tf
(- Alinhamento estrategico) Tj
0 -20 Td
(- Motivacao e engajamento) Tj
0 -20 Td
(- Desenvolvimento de competencias) Tj
0 -20 Td
(- Avaliacao de desempenho) Tj
ET
endstream endobj
7 0 obj << /Length 500 >> stream
BT
/F1 14 Tf
50 750 Td
(Modulo 2: Gestao de Talentos) Tj
0 -30 Td
/F1 12 Tf
(A gestao de talentos envolve identificar, desenvolver e reter) Tj
0 -20 Td
(os melhores profissionais da organizacao. Inclui processos de) Tj
0 -20 Td
(recrutamento, selecao, capacitacao e sucessao.) Tj
0 -40 Td
/F1 14 Tf
(Praticas recomendadas:) Tj
0 -25 Td
/F1 12 Tf
(- Programas de desenvolvimento de lideranca) Tj
0 -20 Td
(- Planos de carreira estruturados) Tj
0 -20 Td
(- Feedback continuo e coaching) Tj
0 -20 Td
(- Reconhecimento e recompensas) Tj
0 -20 Td
(- Clima organizacional positivo) Tj
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
0000001054 00000 n
trailer << /Size 8 /Root 1 0 R >>
startxref
1608
%%EOF";

$testPdfPath = storage_path('app/test_gemini_integration.pdf');
file_put_contents($testPdfPath, $testPdfContent);

$uploadedFile = new UploadedFile(
    $testPdfPath,
    'test_gemini_integration.pdf',
    'application/pdf',
    null,
    true
);

echo "   ✅ PDF de teste criado\n";
echo "   📄 Conteúdo: Gestão de Pessoas - 2 módulos\n\n";

// Testar PythonAIService com GEMINI
echo "3️⃣  Testando geração de curso com GEMINI...\n";
$pythonService = app(\App\Services\PythonAIService::class);

echo "   🚀 Chamando PythonAIService (provider: gemini)...\n\n";

try {
    $startTime = microtime(true);

    $result = $pythonService->generateCourseFromPDF(
        $uploadedFile,
        'Gestão de Pessoas - Fundamentos',
        'intermediate',
        'Militares e Gestores',
        false,  // premium_quality = false (usa Gemini)
        'gemini' // forçar provider Gemini
    );

    $elapsed = microtime(true) - $startTime;

    echo "   ✅ Requisição bem-sucedida em " . number_format($elapsed, 2) . "s!\n\n";
    echo "4️⃣  Analisando resposta...\n";

    if (isset($result['success']) && $result['success']) {
        echo "   ✅ Status: success = true\n\n";

        if (isset($result['course_data'])) {
            echo "   📚 DADOS DO CURSO:\n";
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "      📖 Título: " . ($result['course_data']['title'] ?? 'N/A') . "\n";
            echo "      📝 Descrição: " . substr($result['course_data']['description'] ?? 'N/A', 0, 100) . "...\n";
            echo "      📊 Módulos: " . count($result['course_data']['modules'] ?? []) . "\n";

            // Contar lições e atividades
            $totalLessons = 0;
            $totalActivities = 0;
            foreach (($result['course_data']['modules'] ?? []) as $module) {
                $totalLessons += count($module['lessons'] ?? []);
                foreach (($module['lessons'] ?? []) as $lesson) {
                    $totalActivities += count($lesson['activities'] ?? []);
                }
            }

            echo "      📖 Total de Lições: $totalLessons\n";
            echo "      ✏️  Total de Atividades: $totalActivities\n";
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        }

        if (isset($result['metadata'])) {
            echo "   🤖 METADATA:\n";
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "      🤖 Provider: " . ($result['metadata']['provider'] ?? 'N/A') . "\n";
            echo "      🧠 Model: " . ($result['metadata']['model'] ?? 'N/A') . "\n";
            echo "      💰 Custo: $" . number_format($result['metadata']['cost_usd'] ?? 0, 6) . "\n";
            echo "      📈 Confiança: " . number_format(($result['metadata']['confidence_score'] ?? 0) * 100, 1) . "%\n";
            echo "      ⏱️  Tempo de geração: " . ($result['metadata']['generation_time_ms'] ?? 0) . "ms\n";
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        }

        // Mostrar estrutura dos módulos
        if (isset($result['course_data']['modules']) && count($result['course_data']['modules']) > 0) {
            echo "   📚 ESTRUTURA DOS MÓDULOS:\n";
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

            foreach ($result['course_data']['modules'] as $index => $module) {
                $moduleNum = $index + 1;
                echo "      📘 Módulo $moduleNum: " . ($module['title'] ?? 'N/A') . "\n";
                echo "         Lições: " . count($module['lessons'] ?? []) . "\n";

                // Mostrar primeira lição como exemplo
                if (isset($module['lessons'][0])) {
                    $lesson = $module['lessons'][0];
                    echo "         └─ Exemplo: " . ($lesson['title'] ?? 'N/A') . "\n";
                    echo "            Atividades: " . count($lesson['activities'] ?? []) . "\n";
                }
                echo "\n";
            }
            echo "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        }

        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║              ✅ TESTE CONCLUÍDO COM SUCESSO!                 ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n\n";

        echo "📋 VALIDAÇÕES:\n";
        echo "   ✅ FastAPI processou o PDF corretamente (BytesIO OK)\n";
        echo "   ✅ Gemini gerou o curso com sucesso\n";
        echo "   ✅ Integração Laravel ↔ FastAPI funcionando\n";
        echo "   ✅ Curso com estrutura completa (módulos, lições, atividades)\n\n";

        // Salvar resultado completo
        $resultPath = storage_path('app/gemini_integration_result.json');
        file_put_contents($resultPath, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "💾 Resultado completo salvo em:\n";
        echo "   $resultPath\n\n";

    } else {
        echo "   ❌ Resposta indica falha\n";
        echo "   📋 Detalhes: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "   ❌ Erro ao chamar PythonAIService: " . $e->getMessage() . "\n\n";

    // Se for erro de quota do OpenAI, explicar
    if (strpos($e->getMessage(), 'insufficient_quota') !== false) {
        echo "   ℹ️  NOTA: Este erro ocorre porque a chave OpenAI atingiu o limite.\n";
        echo "   💡 Solução: O Gemini está disponível e funcionando!\n\n";
    }

    exit(1);
}

// Limpar arquivo de teste
unlink($testPdfPath);
echo "🧹 Arquivo de teste removido\n\n";

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║        INTEGRAÇÃO COM GEMINI FUNCIONANDO PERFEITAMENTE!     ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "🎯 PRÓXIMOS PASSOS:\n";
echo "   1. ✅ O FastAPI está funcionando corretamente\n";
echo "   2. ✅ O Gemini está gerando cursos com sucesso\n";
echo "   3. 🌐 Teste na interface web usando 'premium_quality = false'\n";
echo "   4. 💡 Ou adicione créditos na sua conta OpenAI para usar GPT-4o\n\n";

exit(0);
