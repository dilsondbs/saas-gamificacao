<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use App\Http\Controllers\EduAIController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

echo "\n";
echo "===========================================\n";
echo "   TESTE UPLOAD REAL - PDF TO CURSO\n";
echo "===========================================\n\n";

// Verificar se o PDF existe
$pdfPath = storage_path('app/pdfs/nocoes-direito.pdf');

if (!file_exists($pdfPath)) {
    echo "❌ PDF não encontrado: {$pdfPath}\n";
    echo "   Crie o arquivo primeiro.\n\n";
    exit(1);
}

$pdfName = basename($pdfPath);
echo "📤 Enviando PDF: {$pdfName}\n";
echo "📍 Endpoint: POST /eduai/generate-course-from-file\n";
echo "📊 Tamanho: " . number_format(filesize($pdfPath) / 1024, 2) . " KB\n\n";

// Limpar logs antigos para facilitar análise
$logPath = storage_path('logs/laravel.log');
$logSizeBefore = file_exists($logPath) ? filesize($logPath) : 0;

echo "⏳ Aguardando resposta...\n\n";

// Criar arquivo temporário para simular upload
$tempFile = tmpfile();
$tempPath = stream_get_meta_data($tempFile)['uri'];
copy($pdfPath, $tempPath);

// Criar UploadedFile fake
$uploadedFile = new UploadedFile(
    $tempPath,
    $pdfName,
    'application/pdf',
    null,
    true // test mode
);

// Buscar usuário real do banco de dados
$user = \App\Models\User::first();
$userWasCreated = false;

// Se não existir usuário, criar um
if (!$user) {
    echo "⚠️  Nenhum usuário encontrado. Criando usuário de teste...\n";
    $user = \App\Models\User::create([
        'name' => 'Teste Dual Brain',
        'email' => 'teste@dualbrain.com',
        'password' => bcrypt('password123'),
        'role' => 'instructor',
        'tenant_id' => 'test_tenant_' . time()
    ]);
    $userWasCreated = true;
    echo "✅ Usuário criado: {$user->email}\n\n";
} else {
    echo "✅ Usando usuário existente: {$user->email}\n\n";
}

// Autenticar com usuário real
Auth::login($user);

// Criar request fake
$request = Request::create('/eduai/generate-course-from-file', 'POST', [
    'title' => 'Noções de Direito para Militares',
    'target_audience' => 'Militares em formação',
    'difficulty' => 'beginner'
]);

$request->files->set('file', $uploadedFile);

// Iniciar cronômetro
$startTime = microtime(true);

try {
    // Instanciar controller e chamar método
    $geminiService = app(\App\Services\GeminiAIService::class);
    $dualBrainService = app(\App\Services\GeminiDualBrainService::class);
    $controller = new EduAIController($geminiService, $dualBrainService);

    // Executar geração
    $response = $controller->generateCourseFromFile($request);

    $endTime = microtime(true);
    $totalTime = $endTime - $startTime;

    // Obter dados da resposta
    $responseData = json_decode($response->getContent(), true);
    $statusCode = $response->getStatusCode();

    echo "===========================================\n";
    echo "✅ RESPOSTA RECEBIDA\n";
    echo "===========================================\n";
    echo "Status: {$statusCode} " . ($statusCode === 200 ? 'OK' : 'ERROR') . "\n";
    echo "Tempo Total: " . number_format($totalTime, 2) . "s\n";

    if (isset($responseData['courseData']['saved_course_id'])) {
        echo "Curso ID: " . $responseData['courseData']['saved_course_id'] . "\n";
    }

    echo "\n";

    // Analisar logs
    echo "📊 VERIFICANDO LOGS...\n";
    echo "-------------------------------------------\n";

    // Ler logs novos (apenas o que foi adicionado)
    if (file_exists($logPath)) {
        $logContent = file_get_contents($logPath);
        $newLogs = substr($logContent, $logSizeBefore);

        // Buscar marcadores importantes
        $usedDualBrain = strpos($newLogs, '[Controller] Tentando Dual Brain') !== false;
        $dualBrainSuccess = strpos($newLogs, '[Controller] Dual Brain sucesso') !== false;
        $dualBrainFailed = strpos($newLogs, '[Controller] Dual Brain falhou') !== false;
        $usedFallback = strpos($newLogs, 'usando método antigo') !== false;

        // Extrair tempos do Dual Brain
        $analysisTime = null;
        $generationTime = null;

        if (preg_match('/Etapa 1: Análise.*?(\d+\.\d+)s/', $newLogs, $matches)) {
            $analysisTime = $matches[1];
        }

        if (preg_match('/Etapa 2: Geração.*?(\d+\.\d+)s/', $newLogs, $matches)) {
            $generationTime = $matches[1];
        }

        // Exibir logs formatados
        if ($usedDualBrain) {
            echo "✅ [Controller] Tentando Dual Brain...\n";

            if ($analysisTime) {
                echo "✅ [Dual Brain] Etapa 1: Análise - {$analysisTime}s\n";
            }

            if ($generationTime) {
                echo "✅ [Dual Brain] Etapa 2: Geração - {$generationTime}s\n";
            }

            if ($dualBrainSuccess) {
                echo "✅ [Controller] Dual Brain sucesso!\n";
            } elseif ($dualBrainFailed) {
                echo "⚠️  [Controller] Dual Brain falhou\n";
            }
        }

        echo "\n";

        // Resultado
        echo "🎯 MÉTODO USADO: ";
        if ($dualBrainSuccess) {
            echo "Dual Brain ✅\n";
            echo "❌ Fallback NÃO foi necessário\n";
        } elseif ($usedFallback) {
            echo "Método Antigo (Fallback) ⚠️\n";
            echo "⚠️  Dual Brain falhou ou não executou\n";
        } else {
            echo "Desconhecido ❓\n";
        }

        echo "\n";

        // Performance comparison
        if ($analysisTime && $generationTime && $dualBrainSuccess) {
            echo "⏱️  PERFORMANCE DUAL BRAIN:\n";
            echo "-------------------------------------------\n";
            echo "Análise (Gemini 2.5):     {$analysisTime}s\n";
            echo "Geração (Gemini 1.5 Pro): {$generationTime}s\n";
            $dualBrainTotal = floatval($analysisTime) + floatval($generationTime);
            echo "Subtotal Dual Brain:      " . number_format($dualBrainTotal, 2) . "s\n";
            echo "Overhead (processamento): " . number_format($totalTime - $dualBrainTotal, 2) . "s\n";
            echo "\n";
        }
    }

    // Estrutura do curso
    if ($statusCode === 200 && isset($responseData['courseData'])) {
        $courseData = $responseData['courseData'];

        echo "📦 ESTRUTURA DO CURSO:\n";
        echo "-------------------------------------------\n";
        echo "Título: " . ($courseData['title'] ?? 'N/A') . "\n";
        echo "Descrição: " . substr($courseData['description'] ?? 'N/A', 0, 100) . "...\n";
        echo "Dificuldade: " . ($courseData['difficulty'] ?? 'N/A') . "\n";

        $modulesCount = count($courseData['modules'] ?? []);
        $lessonsCount = 0;

        foreach ($courseData['modules'] ?? [] as $module) {
            $lessonsCount += count($module['lessons'] ?? []);
        }

        echo "Módulos: {$modulesCount}\n";
        echo "Lições: {$lessonsCount}\n";
        echo "Pontos: " . ($courseData['points_per_completion'] ?? 'N/A') . "\n";
        echo "\n";

        // Detalhar módulos
        echo "📚 MÓDULOS:\n";
        echo "-------------------------------------------\n";
        foreach ($courseData['modules'] ?? [] as $index => $module) {
            echo "Módulo " . ($index + 1) . ": " . ($module['title'] ?? 'N/A') . "\n";
            echo "  └─ " . count($module['lessons'] ?? []) . " lições\n";

            // Primeiras 2 lições
            $lessons = array_slice($module['lessons'] ?? [], 0, 2);
            foreach ($lessons as $lIndex => $lesson) {
                echo "     └─ " . ($lesson['title'] ?? 'N/A') . " (" . ($lesson['type'] ?? 'N/A') . ")\n";
            }

            if (count($module['lessons'] ?? []) > 2) {
                echo "     └─ ... +" . (count($module['lessons']) - 2) . " mais\n";
            }
            echo "\n";
        }

        // Salvar JSON completo
        $outputFile = storage_path('app/test_output_course.json');
        file_put_contents($outputFile, json_encode($courseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "💾 JSON completo salvo em: {$outputFile}\n\n";
    }

    echo "===========================================\n";
    if ($statusCode === 200 && $dualBrainSuccess) {
        echo "✅ TESTE COMPLETO COM SUCESSO!\n";
        echo "   Dual Brain funcionou perfeitamente!\n";
    } elseif ($statusCode === 200) {
        echo "⚠️  TESTE COMPLETO COM AVISOS\n";
        echo "   Curso gerado, mas usando fallback\n";
    } else {
        echo "❌ TESTE FALHOU\n";
        echo "   Erro: " . ($responseData['message'] ?? 'Desconhecido') . "\n";
    }
    echo "===========================================\n\n";

    // Mostrar logs completos se houver erro
    if ($statusCode !== 200) {
        echo "📋 LOGS DE ERRO:\n";
        echo "-------------------------------------------\n";
        echo substr($newLogs, -2000) . "\n";
        echo "-------------------------------------------\n\n";
    }

} catch (\Exception $e) {
    $endTime = microtime(true);
    $totalTime = $endTime - $startTime;

    echo "===========================================\n";
    echo "❌ EXCEÇÃO CAPTURADA\n";
    echo "===========================================\n";
    echo "Tempo até erro: " . number_format($totalTime, 2) . "s\n";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n";
    echo "Linha: " . $e->getLine() . "\n\n";

    echo "Stack Trace:\n";
    echo $e->getTraceAsString() . "\n\n";

    echo "===========================================\n\n";
} finally {
    // Limpar arquivo temporário
    if (isset($tempFile)) {
        fclose($tempFile);
    }

    // Cleanup: deletar usuário de teste se foi criado
    if (isset($userWasCreated) && $userWasCreated && isset($user) && $user->email === 'teste@dualbrain.com') {
        echo "🧹 Limpando: Deletando usuário de teste...\n";
        try {
            $user->delete();
            echo "✅ Usuário de teste deletado\n\n";
        } catch (\Exception $e) {
            echo "⚠️  Não foi possível deletar usuário: " . $e->getMessage() . "\n\n";
        }
    }
}
