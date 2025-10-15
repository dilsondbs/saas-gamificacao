$OutputEncoding = [System.Text.Encoding]::UTF8
param([string]$Pergunta, [string]$ApiKey)
$ApiKey = $ApiKey.Trim("'")
$Pergunta = $Pergunta.Trim("'")
$modelo = "gemini-pro-latest"
$uri = "https://generativelanguage.googleapis.com/v1beta/models/$($modelo):generateContent?key=$($ApiKey)"
$headers = @{"Content-Type" = "application/json"}
$body = @{contents = @(@{parts = @(@{text = $Pergunta})})} | ConvertTo-Json -Depth 5
try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body -ErrorAction Stop
    $respostaTexto = $response.candidates.content.parts.text
    Write-Output $respostaTexto
}
catch {
    Write-Output "ERRO AO CHAMAR API: $($_.Exception.Message)"
}