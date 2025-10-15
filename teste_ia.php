<?php
echo "<pre>";
$minhaChaveApi = "AIzaSyBsZ-oYcJlMDJepBAeGeYRk56VDoydPliE"; // Certifique-se de que a chave do projeto Meu-Projeto-IA está aqui
$pergunta = "Qual a importância da gamificação em um projeto SaaS? Responda em 30 palavras.";
$caminhoScript = __DIR__ . "\\scripts\\chamar_gemini.ps1";
$comando = "powershell.exe -ExecutionPolicy Bypass -File \"$caminhoScript\" -ApiKey '" . escapeshellarg($minhaChaveApi) . "' -Pergunta '" . escapeshellarg($pergunta) . "'";
echo "Executando...\n\n";
$resposta = shell_exec($comando);
echo "--- RESPOSTA DO GEMINI ---\n";
print_r($resposta);
?>