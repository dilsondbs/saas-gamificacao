<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║         TESTE DE CONFIGURAÇÃO GEMINI API KEY                 ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Testar .env
echo "1️⃣  Lendo do .env:\n";
$envKey = env('GEMINI_API_KEY');
echo "   GEMINI_API_KEY: " . ($envKey ? substr($envKey, 0, 20) . "..." : "❌ NÃO ENCONTRADA") . "\n";
echo "   Comprimento: " . strlen($envKey ?? '') . " caracteres\n\n";

// Testar config
echo "2️⃣  Lendo do config('services.gemini.api_key'):\n";
$configKey = config('services.gemini.api_key');
echo "   API Key: " . ($configKey ? substr($configKey, 0, 20) . "..." : "❌ NÃO ENCONTRADA") . "\n";
echo "   Comprimento: " . strlen($configKey ?? '') . " caracteres\n\n";

// Testar serviço
echo "3️⃣  Testando GeminiAIService:\n";
try {
    $geminiService = app(\App\Services\GeminiAIService::class);

    // Usar reflexão para ver a chave privada
    $reflection = new \ReflectionClass($geminiService);
    $apiKeyProperty = $reflection->getProperty('apiKey');
    $apiKeyProperty->setAccessible(true);
    $serviceKey = $apiKeyProperty->getValue($geminiService);

    echo "   API Key no serviço: " . ($serviceKey ? substr($serviceKey, 0, 20) . "..." : "❌ NÃO ENCONTRADA") . "\n";
    echo "   Comprimento: " . strlen($serviceKey ?? '') . " caracteres\n\n";

    // Comparar
    if ($envKey === $configKey && $configKey === $serviceKey) {
        echo "✅ TODAS AS CHAVES COINCIDEM!\n\n";
    } else {
        echo "❌ INCONSISTÊNCIA DETECTADA:\n";
        echo "   .env: " . strlen($envKey ?? '') . " chars\n";
        echo "   config: " . strlen($configKey ?? '') . " chars\n";
        echo "   service: " . strlen($serviceKey ?? '') . " chars\n\n";
    }

} catch (\Exception $e) {
    echo "   ❌ Erro: " . $e->getMessage() . "\n\n";
}

// Teste rápido com a API
echo "4️⃣  Testando chamada à API Gemini:\n";

if ($configKey) {
    try {
        $client = new \GuzzleHttp\Client();
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' . $configKey;

        $response = $client->post($url, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => 'Responda apenas: OK']
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 50
                ]
            ]
        ]);

        if ($response->getStatusCode() === 200) {
            echo "   ✅ API Gemini respondeu com sucesso!\n";
            $body = json_decode($response->getBody(), true);
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? 'N/A';
            echo "   📝 Resposta: $text\n\n";
        }

    } catch (\GuzzleHttp\Exception\ClientException $e) {
        echo "   ❌ Erro " . $e->getResponse()->getStatusCode() . ": ";
        echo $e->getResponse()->getReasonPhrase() . "\n";
        echo "   Detalhes: " . $e->getMessage() . "\n\n";
    } catch (\Exception $e) {
        echo "   ❌ Erro: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ⚠️  Pulando teste - chave não configurada\n\n";
}

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                      DIAGNÓSTICO                             ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

if (!$configKey) {
    echo "❌ PROBLEMA: Chave Gemini não está sendo lida pelo Laravel\n\n";
    echo "SOLUÇÕES:\n";
    echo "1. Verifique se .env tem: GEMINI_API_KEY=AIza...\n";
    echo "2. Execute: php artisan config:clear\n";
    echo "3. Reinicie o servidor web (Apache/Nginx)\n\n";
} elseif ($configKey && strlen($configKey) < 20) {
    echo "❌ PROBLEMA: Chave parece inválida (muito curta)\n\n";
    echo "Chave Gemini deve ter ~39 caracteres\n";
    echo "Formato: AIzaSy...\n\n";
} else {
    echo "✅ CONFIGURAÇÃO OK!\n\n";
    echo "Se ainda está falhando na interface:\n";
    echo "1. Reinicie Apache/PHP-FPM\n";
    echo "2. Limpe cache do navegador\n";
    echo "3. Teste novamente\n\n";
}
