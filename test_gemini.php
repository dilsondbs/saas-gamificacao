<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔍 TESTANDO GEMINI API\n\n";

$apiKey = env('GEMINI_API_KEY');
echo "🔑 API Key: " . substr($apiKey, 0, 20) . "...\n\n";

echo "📡 Fazendo requisição para Gemini...\n";

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" . $apiKey;

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Diga apenas "OK" se você está funcionando']
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 100
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Status HTTP: $httpCode\n";

if ($httpCode === 200) {
    echo "✅ GEMINI ESTÁ FUNCIONANDO!\n\n";
    $result = json_decode($response, true);

    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        echo "💬 Resposta: " . $result['candidates'][0]['content']['parts'][0]['text'] . "\n";
    }

    echo "\n📋 Resposta completa:\n";
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ GEMINI NÃO ESTÁ FUNCIONANDO!\n\n";
    echo "📋 Resposta do servidor:\n";
    echo $response . "\n";
}
