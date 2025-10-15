<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class GeminiDualBrainService
{
    private $client;
    private $apiKey;
    private $gemini25Url;
    private $gemini15ProUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.gemini.api_key');
        $this->gemini25Url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';
        $this->gemini15ProUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent';
    }

    /**
     * 1. Analisar PDF com Gemini 2.5 (análise rápida)
     */
    public function analyzePDF($pdfContent)
    {
        Log::info('🧠 [Dual Brain] Etapa 1: Analisando PDF com Gemini 2.5', [
            'content_length' => strlen($pdfContent)
        ]);

        $prompt = "Analise este PDF e retorne APENAS um JSON com esta estrutura exata: {\"topics\": [\"tópico1\", \"tópico2\", \"tópico3\"], \"difficulty\": \"beginner\"}\n\nConteúdo do PDF:\n" . substr($pdfContent, 0, 3000);

        try {
            $response = $this->client->post($this->gemini25Url . '?key=' . $this->apiKey, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.3,
                        'maxOutputTokens' => 200
                    ]
                ],
                'timeout' => 30
            ]);

            $body = $response->getBody()->getContents();
            $decoded = json_decode($body, true);

            if (!isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('🧠 [Dual Brain] Resposta inválida do Gemini 2.5');
                return null;
            }

            $content = $decoded['candidates'][0]['content']['parts'][0]['text'];

            // Limpar markdown
            $content = preg_replace('/```json\s*/', '', $content);
            $content = preg_replace('/```\s*$/', '', $content);
            $content = trim($content);

            $analysis = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($analysis['topics']) || !isset($analysis['difficulty'])) {
                Log::error('🧠 [Dual Brain] JSON inválido na análise', [
                    'json_error' => json_last_error_msg(),
                    'content' => substr($content, 0, 500)
                ]);
                return null;
            }

            Log::info('✅ [Dual Brain] Análise PDF concluída', [
                'topics_count' => count($analysis['topics']),
                'difficulty' => $analysis['difficulty']
            ]);

            return $analysis;

        } catch (\Exception $e) {
            Log::error('❌ [Dual Brain] Erro ao analisar PDF', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * 2. Gerar curso com Gemini 1.5 Pro (geração completa)
     */
    public function generateCourseFromAnalysis($analysis, $title)
    {
        Log::info('🧠 [Dual Brain] Etapa 2: Gerando curso com Gemini 1.5 Pro', [
            'title' => $title,
            'topics' => $analysis['topics'],
            'difficulty' => $analysis['difficulty']
        ]);

        $topicsList = implode("\n- ", $analysis['topics']);

        $prompt = "Crie um curso completo sobre '{$title}' com nível {$analysis['difficulty']}.

TÓPICOS A COBRIR:
- {$topicsList}

Retorne um JSON com esta estrutura EXATA:
{
  \"title\": \"{$title}\",
  \"description\": \"Descrição do curso\",
  \"difficulty\": \"{$analysis['difficulty']}\",
  \"estimated_hours\": 8,
  \"points_per_completion\": 100,
  \"modules\": [
    {
      \"title\": \"Módulo 1\",
      \"description\": \"Descrição\",
      \"lessons\": [
        {
          \"title\": \"Aula 1\",
          \"content\": \"Conteúdo detalhado da aula\",
          \"duration_minutes\": 15,
          \"objectives\": [\"objetivo 1\"],
          \"type\": \"lesson\"
        }
      ]
    }
  ]
}

IMPORTANTE: Crie pelo menos 3 módulos com 3-4 aulas cada. Use os tópicos fornecidos.";

        try {
            $response = $this->client->post($this->gemini15ProUrl . '?key=' . $this->apiKey, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 32768
                    ]
                ],
                'timeout' => 120
            ]);

            $body = $response->getBody()->getContents();
            $decoded = json_decode($body, true);

            if (!isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('🧠 [Dual Brain] Resposta inválida do Gemini 1.5 Pro', [
                    'response' => $decoded
                ]);
                return null;
            }

            $content = $decoded['candidates'][0]['content']['parts'][0]['text'];

            // Limpar markdown
            $content = preg_replace('/```json\s*/', '', $content);
            $content = preg_replace('/```\s*$/', '', $content);
            $content = trim($content);

            // Remover caracteres de controle
            $content = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $content);

            $courseData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('🧠 [Dual Brain] JSON inválido no curso', [
                    'json_error' => json_last_error_msg(),
                    'content_sample' => substr($content, 0, 500)
                ]);
                return null;
            }

            Log::info('✅ [Dual Brain] Curso gerado com sucesso', [
                'title' => $courseData['title'] ?? 'N/A',
                'modules_count' => count($courseData['modules'] ?? [])
            ]);

            return $courseData;

        } catch (\Exception $e) {
            Log::error('❌ [Dual Brain] Erro ao gerar curso', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * 3. Método principal: Dual Brain (análise + geração)
     */
    public function generateCourseWithDualBrain($pdfContent, $title)
    {
        Log::info('🚀 [Dual Brain] Iniciando processo completo', [
            'title' => $title,
            'pdf_length' => strlen($pdfContent)
        ]);

        // Etapa 1: Analisar PDF com Gemini 2.5
        $analysis = $this->analyzePDF($pdfContent);

        if (!$analysis) {
            Log::error('❌ [Dual Brain] Falha na análise do PDF');
            return null;
        }

        // Etapa 2: Gerar curso com Gemini 1.5 Pro
        $courseData = $this->generateCourseFromAnalysis($analysis, $title);

        if (!$courseData) {
            Log::error('❌ [Dual Brain] Falha na geração do curso');
            return null;
        }

        Log::info('🎉 [Dual Brain] Processo completo bem-sucedido!', [
            'title' => $courseData['title'],
            'modules' => count($courseData['modules'] ?? [])
        ]);

        return $courseData;
    }
}
