<?php
// gemini.php

// PEGUE A SUA PERGUNTA DO TERMINAL
if (!isset($argv[1])) {
    echo "ERRO: Por favor, forneça uma pergunta entre aspas.\n";
    echo "Exemplo: php gemini.php \"Qual a capital do Brasil?\"\n";
    exit;
}
$pergunta = $argv[1];

// SUA CHAVE DA API (A MESMA QUE FUNCIONA NO LARAVEL)
$apiKey = "AIzaSyBsZ-oYcJlMDJepBAeGeYRk56VDoydPliE"; // Cole sua chave aqui

// CONFIGURAÇÃO DA CHAMADA PARA A API
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" . $apiKey; 	
$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => $pergunta]
            ]
        ]
    ]
];
$jsonData = json_encode($data);

// INICIALIZA O cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Apenas para ambiente local (XAMPP)

// EXECUTA A CHAMADA E OBTÉM A RESPOSTA
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo 'Erro no cURL: ' . curl_error($ch) . "\n";
} else {
    // SE FUNCIONOU, DECODIFICA A RESPOSTA
    $responseData = json_decode($response, true);

    if ($httpCode == 200) {
        // EXTRAI E MOSTRA O TEXTO
        if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            echo "\n--- Resposta do Gemini ---\n";
            echo $responseData['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
        } else {
            echo "ERRO: A resposta da API não tem o formato esperado.\n";
            print_r($responseData);
        }
    } else {
        // SE DEU ERRO, MOSTRA O ERRO
        echo "ERRO NA API (HTTP Code: $httpCode):\n";
        echo $response . "\n";
    }
}

curl_close($ch);