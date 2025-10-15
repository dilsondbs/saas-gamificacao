<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class GeminiAIService
{
    private $client;
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';
    }

    /**
     * Gerar curso completo com IA
     */
    public function generateCourse($description, $targetAudience = null, $difficulty = 'intermediate')
    {
        $prompt = $this->buildCoursePrompt($description, $targetAudience, $difficulty);

        try {
            $response = $this->makeRequest($prompt, 'generate_course');
            $courseData = $this->parseCourseResponse($response);

            // Validar qualidade do conteúdo gerado
            $quality = $this->validateContentQuality($courseData, 'course');

            Log::info('GeminiAI: Qualidade do curso avaliada', [
                'quality_score' => $quality['quality_score'],
                'is_valid' => $quality['is_valid'],
                'issues_count' => count($quality['issues'])
            ]);

            // Se qualidade muito baixa, usar fallback melhorado
            if ($quality['quality_score'] < 40) {
                Log::warning('GeminiAI: Qualidade insuficiente, usando fallback', $quality);
                return $this->getEnhancedFallbackCourse($description, $targetAudience, $difficulty);
            }

            return $courseData;

        } catch (\Exception $e) {
            Log::error('Erro ao gerar curso com Gemini: ' . $e->getMessage());
            return $this->getEnhancedFallbackCourse($description, $targetAudience, $difficulty);
        }
    }

    /**
     * Gerar curso a partir de conteúdo extraído de arquivo
     */
    public function generateCourseFromContent($extractedContent, $title, $targetAudience = null, $difficulty = 'intermediate')
    {
        $prompt = $this->buildCourseFromContentPrompt($extractedContent, $title, $targetAudience, $difficulty);

        try {
            Log::info('🤖 Gerando curso com IA a partir do conteúdo do arquivo', [
                'content_length' => strlen($extractedContent),
                'title' => $title,
                'target_audience' => $targetAudience,
                'difficulty' => $difficulty,
            ]);

            $response = $this->makeRequest($prompt, 'generate_course');
            $courseData = $this->parseCourseResponse($response);

            // Aplicar melhorias específicas para conteúdo real
            $courseData = $this->enhanceWithRealContent($courseData, $extractedContent);

            // Aplicar Gates de Progressão e Micro-learning
            $courseData = $this->applyGameProgressionRules($courseData);

            Log::info('✅ Curso gerado com sucesso a partir do conteúdo', [
                'title' => $courseData['title'] ?? 'Sem título',
                'modules_count' => count($courseData['modules'] ?? []),
                'activities_count' => $this->countActivities($courseData),
            ]);

            return $courseData;

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar curso com conteúdo real', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'title' => $title,
                'content_length' => strlen($extractedContent),
                'content_preview' => substr($extractedContent, 0, 200)
            ]);
            return $this->getEnhancedFallbackCourseFromContent($extractedContent, $title, $targetAudience, $difficulty);
        }
    }

    /**
     * Gerar atividades gamificadas
     */
    public function generateGamifiedActivities($courseTitle, $topic, $count = 5)
    {
        $prompt = $this->buildActivitiesPrompt($courseTitle, $topic, $count);

        try {
            $response = $this->makeRequest($prompt, 'generate_activities');
            return $this->parseActivitiesResponse($response);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar atividades com Gemini: ' . $e->getMessage());
            return $this->getFallbackActivities($topic, $count);
        }
    }

    /**
     * Gerar badges personalizadas
     */
    public function generateBadges($courseTitle, $topics = [])
    {
        $prompt = $this->buildBadgesPrompt($courseTitle, $topics);

        try {
            $response = $this->makeRequest($prompt, 'generate_badges');
            return $this->parseBadgesResponse($response);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar badges com Gemini: ' . $e->getMessage());
            return $this->getFallbackBadges($courseTitle);
        }
    }

    /**
     * Gerar conteúdo para canvas visual
     */
    public function generateCanvasContent($topic, $visualType = 'mindmap')
    {
        $prompt = $this->buildCanvasPrompt($topic, $visualType);

        try {
            $response = $this->makeRequest($prompt, 'generate_canvas');
            return $this->parseCanvasResponse($response);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar canvas com Gemini: ' . $e->getMessage());
            return $this->getFallbackCanvas($topic);
        }
    }

    /**
     * Fazer requisição para API do Gemini
     */
    private function makeRequest($prompt, $action = 'api_call')
    {
        Log::info('GeminiAI: Iniciando requisição', [
            'prompt_length' => strlen($prompt),
            'api_key_configured' => !empty($this->apiKey),
            'action' => $action
        ]);

        try {
            $response = $this->client->post($this->baseUrl . '?key=' . $this->apiKey, [
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
                        'temperature' => 0.9,  // Mais criativo
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 32768  // Gemini 2.5 Flash suporta até 32768
                    ]
                ]
            ]);

            $body = $response->getBody()->getContents();
            $decoded = json_decode($body, true);

            // Extrair informações de uso de tokens
            $inputTokens = $decoded['usageMetadata']['promptTokenCount'] ?? null;
            $outputTokens = $decoded['usageMetadata']['candidatesTokenCount'] ?? null;

            Log::info('GeminiAI: Resposta recebida', [
                'status' => $response->getStatusCode(),
                'response_length' => strlen($body),
                'has_candidates' => isset($decoded['candidates']),
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens
            ]);

            // Registrar uso da API
            $this->logUsage($action, $inputTokens, $outputTokens);

            return $decoded;

        } catch (\Exception $e) {
            Log::error('GeminiAI: Erro na requisição', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'api_url' => $this->baseUrl
            ]);

            // Re-throw para usar fallback
            throw $e;
        }
    }

    /**
     * Construir prompt para geração de curso
     */
    private function buildCoursePrompt($description, $targetAudience, $difficulty)
    {
        return "Você é um PEDAGOGO ESPECIALISTA em design instrucional e criação de cursos educacionais de altíssima qualidade.

CRIE um curso EXCEPCIONAL e ALTAMENTE ENVOLVENTE em português brasileiro:

🎯 DESCRIÇÃO DO CURSO: {$description}
👥 PÚBLICO-ALVO: " . ($targetAudience ?: 'Público geral') . "
📊 NÍVEL: {$difficulty}

DIRETRIZES ESPECÍFICAS:
✓ Crie um título CATIVANTE e PROFISSIONAL (máx 60 caracteres)
✓ Desenvolva 3-5 módulos com PROGRESSÃO LÓGICA
✓ Cada módulo deve ter 2-4 aulas DENSAS e PRÁTICAS
✓ Adapte a linguagem e complexidade para o público-alvo
✓ Inclua conteúdo ACIONÁVEL e APLICÁVEL
✓ Objetivos de aprendizagem ESPECÍFICOS e MENSURÁVEIS

📝 RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:

{
  \"title\": \"Título profissional e atrativo do curso\",
  \"description\": \"Descrição envolvente que desperte interesse (máx 200 palavras)\",
  \"duration_hours\": 15,
  \"target_audience\": \"{$targetAudience}\",
  \"difficulty\": \"{$difficulty}\",
  \"modules\": [
    {
      \"title\": \"Título do módulo\",
      \"description\": \"O que o aluno aprenderá neste módulo\",
      \"lessons\": [
        {
          \"title\": \"Título da aula\",
          \"content\": \"Conteúdo detalhado e prático da aula (mín 100 palavras)\",
          \"duration_minutes\": 45
        }
      ]
    }
  ],
  \"learning_objectives\": [\"Objetivo específico 1\", \"Objetivo específico 2\", \"Objetivo específico 3\"],
  \"prerequisites\": [\"Pré-requisito relevante\"],
  \"assessment_methods\": [\"Método de avaliação 1\", \"Método de avaliação 2\"]
}";
    }

    /**
     * Construir prompt para atividades gamificadas
     */
    private function buildActivitiesPrompt($courseTitle, $topic, $count)
    {
        return "Você é um GAME DESIGNER EDUCACIONAL especialista em criar atividades ALTAMENTE ENVOLVENTES e GAMIFICADAS.

CRIE {$count} atividades INCRÍVEIS para:
🎯 CURSO: '{$courseTitle}'
📚 TÓPICO: '{$topic}'

CRITÉRIOS DE EXCELÊNCIA:
✓ Atividades DIVERSIFICADAS (quiz, desafio, simulação, jogo)
✓ Mecânicas de GAMIFICAÇÃO (pontos, níveis, conquistas)
✓ Instruções CLARAS e MOTIVADORAS
✓ Perguntas DESAFIADORAS e BEM ELABORADAS
✓ Feedback CONSTRUTIVO em cada resposta
✓ Tempo REALISTA para execução

📝 RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:

{
  \"activities\": [
    {
      \"title\": \"Título cativante da atividade\",
      \"type\": \"quiz|challenge|simulation|game|exercise\",
      \"description\": \"Descrição motivadora que desperte curiosidade\",
      \"points\": 100,
      \"difficulty\": \"easy|medium|hard\",
      \"estimated_time\": 20,
      \"instructions\": \"Instruções claras e envolventes\",
      \"content\": {
        \"questions\": [
          {
            \"question\": \"Pergunta desafiadora e contextualizada\",
            \"options\": [\"Opção A realista\", \"Opção B plausível\", \"Opção C distratora\", \"Opção D criativa\"],
            \"correct_answer\": 0,
            \"explanation\": \"Explicação detalhada e educativa\"
          }
        ]
      }
    }
  ]
}";
    }

    /**
     * Construir prompt para badges
     */
    private function buildBadgesPrompt($courseTitle, $topics)
    {
        $topicsText = implode(', ', $topics);

        return "Você é um ESPECIALISTA em PSICOLOGIA da MOTIVAÇÃO e GAMIFICAÇÃO EDUCACIONAL.

CRIE badges INSPIRADORAS e MOTIVADORAS para:
🎯 CURSO: '{$courseTitle}'
📚 TÓPICOS: {$topicsText}

PRINCÍPIOS DE EXCELÊNCIA:
✓ Nomes CRIATIVOS e MEMORÁVEIS
✓ Descrições que INSPIREM o aluno
✓ Ícones VISUAL e EMOCIONALMENTE relevantes
✓ Cores que REPRESENTEM a conquista
✓ Critérios CLAROS e ALCANÇÁVEIS
✓ Sistema de RARIDADE balanceado
✓ Pontuação PROPORCIONAL à dificuldade

📝 RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:

{
  \"badges\": [
    {
      \"name\": \"Nome criativo e inspirador\",
      \"description\": \"Descrição motivadora da conquista\",
      \"icon\": \"🏆\",
      \"color\": \"#FFD700\",
      \"criteria\": \"Critérios claros e específicos\",
      \"points\": 75,
      \"rarity\": \"common|rare|epic|legendary\"
    }
  ]
}";
    }

    /**
     * Construir prompt para canvas visual
     */
    private function buildCanvasPrompt($topic, $visualType)
    {
        return "Crie um mapa visual/canvas interativo sobre '{$topic}' no formato '{$visualType}'.

IMPORTANTE: Responda APENAS em formato JSON válido, sem texto adicional.

Estrutura necessária:
{
  \"canvas\": {
    \"title\": \"Título do canvas\",
    \"type\": \"{$visualType}\",
    \"elements\": [
      {
        \"id\": \"element_1\",
        \"type\": \"node|connection|text|shape\",
        \"x\": 100,
        \"y\": 100,
        \"width\": 150,
        \"height\": 80,
        \"text\": \"Texto do elemento\",
        \"color\": \"#4A90E2\",
        \"connections\": [\"element_2\"]
      }
    ],
    \"interactions\": [
      {
        \"element_id\": \"element_1\",
        \"action\": \"click\",
        \"response\": \"Informação adicional\",
        \"points\": 10
      }
    ]
  }
}";
    }

    /**
     * Parse da resposta do curso
     */
    private function parseCourseResponse($response)
    {
        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            Log::error('GeminiAI: Estrutura de resposta inválida', ['response' => $response]);
            throw new \Exception('Resposta inválida da API');
        }

        $content = $response['candidates'][0]['content']['parts'][0]['text'];
        Log::info('GeminiAI: Conteúdo bruto recebido', [
            'content_preview' => substr($content, 0, 200),
            'content_length' => strlen($content)
        ]);

        // Limpar markdown se houver
        $content = preg_replace('/```json\s*/', '', $content);
        $content = preg_replace('/```\s*$/', '', $content);
        $content = trim($content);

        // Sanitizar JSON: remover caracteres problemáticos mas preservar estrutura
        $content = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $content);

        // Se ainda houver erro, tentar com mb_convert_encoding
        $courseData = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE && json_last_error() == JSON_ERROR_CTRL_CHAR) {
            // Tentar conversão de encoding
            $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
            $courseData = json_decode($content, true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('GeminiAI: Erro de JSON parsing', [
                'json_error' => json_last_error_msg(),
                'json_error_code' => json_last_error(),
                'content_sample' => substr($content, 0, 500),
                'content_hex' => bin2hex(substr($content, 0, 100))
            ]);
            throw new \Exception('JSON inválido na resposta: ' . json_last_error_msg());
        }

        Log::info('GeminiAI: Curso parseado com sucesso', [
            'title' => $courseData['title'] ?? 'N/A',
            'modules_count' => count($courseData['modules'] ?? [])
        ]);

        return $this->validateAndEnhanceCourse($courseData);
    }

    /**
     * Parse da resposta de atividades
     */
    private function parseActivitiesResponse($response)
    {
        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Resposta inválida da API');
        }

        $content = $response['candidates'][0]['content']['parts'][0]['text'];
        $activitiesData = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON inválido na resposta: ' . json_last_error_msg());
        }

        return $activitiesData;
    }

    /**
     * Parse da resposta de badges
     */
    private function parseBadgesResponse($response)
    {
        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Resposta inválida da API');
        }

        $content = $response['candidates'][0]['content']['parts'][0]['text'];
        $badgesData = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON inválido na resposta: ' . json_last_error_msg());
        }

        return $badgesData;
    }

    /**
     * Parse da resposta do canvas
     */
    private function parseCanvasResponse($response)
    {
        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Resposta inválida da API');
        }

        $content = $response['candidates'][0]['content']['parts'][0]['text'];
        $canvasData = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON inválido na resposta: ' . json_last_error_msg());
        }

        return $canvasData;
    }

    /**
     * Fallback para curso (quando API falha)
     */
    private function getEnhancedFallbackCourse($description, $targetAudience = null, $difficulty = 'intermediate')
    {
        // Extrair palavras-chave da descrição
        $keywords = $this->extractKeywords($description);
        $subject = $this->detectSubjectFromDescription($description);

        return [
            'title' => $this->generateIntelligentTitle($subject, $targetAudience),
            'description' => $this->generateIntelligentDescription($description, $targetAudience, $difficulty),
            'duration_hours' => $this->calculateDurationByDifficulty($difficulty),
            'target_audience' => $targetAudience ?: 'Público geral',
            'difficulty' => $difficulty,
            'modules' => $this->generateIntelligentModules($subject, $keywords, $difficulty),
            'learning_objectives' => $this->generateIntelligentObjectives($subject, $difficulty),
            'prerequisites' => $this->generateIntelligentPrerequisites($difficulty),
            'assessment_methods' => $this->generateIntelligentAssessments($difficulty)
        ];
    }

    private function extractKeywords($description)
    {
        // Remover palavras comuns e extrair conceitos importantes
        $stopWords = ['de', 'da', 'do', 'para', 'com', 'em', 'um', 'uma', 'curso', 'sobre'];
        $words = preg_split('/\s+/', strtolower($description));

        return array_filter($words, function($word) use ($stopWords) {
            return strlen($word) > 3 && !in_array($word, $stopWords);
        });
    }

    private function detectSubjectFromDescription($description)
    {
        $subjects = [
            'matemática' => 'Matemática',
            'programação' => 'Programação',
            'marketing' => 'Marketing Digital',
            'gestão' => 'Gestão Empresarial',
            'design' => 'Design',
            'inglês' => 'Inglês',
            'história' => 'História',
            'ciências' => 'Ciências',
            'física' => 'Física',
            'química' => 'Química'
        ];

        $desc = strtolower($description);
        foreach ($subjects as $keyword => $subject) {
            if (strpos($desc, $keyword) !== false) {
                return $subject;
            }
        }

        return 'Educação Geral';
    }

    private function generateIntelligentTitle($subject, $targetAudience)
    {
        $templates = [
            'Dominando {subject}: Guia Completo',
            '{subject} na Prática',
            'Curso Completo de {subject}',
            '{subject}: Do Básico ao Avançado'
        ];

        $template = $templates[array_rand($templates)];
        $title = str_replace('{subject}', $subject, $template);

        if ($targetAudience) {
            $title .= ' para ' . $targetAudience;
        }

        return $title;
    }

    private function generateIntelligentDescription($description, $targetAudience, $difficulty)
    {
        $levelTexts = [
            'beginner' => 'Curso introdutório perfeito para iniciantes',
            'intermediate' => 'Curso abrangente com conteúdo prático',
            'advanced' => 'Curso avançado para profissionais experientes'
        ];

        $baseText = $levelTexts[$difficulty] ?? $levelTexts['intermediate'];

        if ($targetAudience) {
            $baseText .= ' especialmente desenvolvido para ' . strtolower($targetAudience);
        }

        return $baseText . '. ' . ucfirst($description) . ' Aprenda com metodologia prática e exemplos reais.';
    }

    private function calculateDurationByDifficulty($difficulty)
    {
        return match($difficulty) {
            'beginner' => 8,
            'intermediate' => 15,
            'advanced' => 25,
            default => 12
        };
    }

    private function generateIntelligentModules($subject, $keywords, $difficulty)
    {
        $moduleTemplates = [
            'beginner' => [
                'Fundamentos de {subject}',
                'Conceitos Essenciais',
                'Primeiros Passos Práticos',
                'Exercícios Básicos'
            ],
            'intermediate' => [
                'Fundamentos de {subject}',
                'Técnicas Intermediárias',
                'Aplicações Práticas',
                'Projetos Reais',
                'Otimização e Boas Práticas'
            ],
            'advanced' => [
                'Revisão de Conceitos Avançados',
                'Técnicas Especializadas',
                'Arquiteturas Complexas',
                'Casos de Estudo Avançados',
                'Tendências e Futuro',
                'Certificação e Especialização'
            ]
        ];

        $templates = $moduleTemplates[$difficulty] ?? $moduleTemplates['intermediate'];
        $modules = [];

        foreach ($templates as $index => $template) {
            $moduleTitle = str_replace('{subject}', $subject, $template);

            $modules[] = [
                'title' => $moduleTitle,
                'description' => $this->generateModuleDescription($moduleTitle, $difficulty),
                'lessons' => $this->generateIntelligentLessons($moduleTitle, $difficulty)
            ];
        }

        return $modules;
    }

    private function generateModuleDescription($moduleTitle, $difficulty)
    {
        $descriptions = [
            'beginner' => "Módulo introdutório que aborda {title} de forma didática e acessível.",
            'intermediate' => "Módulo prático focado em {title} com exercícios e casos reais.",
            'advanced' => "Módulo especializado em {title} para profissionais experientes."
        ];

        $template = $descriptions[$difficulty] ?? $descriptions['intermediate'];
        return str_replace('{title}', strtolower($moduleTitle), $template);
    }

    private function generateIntelligentLessons($moduleTitle, $difficulty)
    {
        $lessonCount = match($difficulty) {
            'beginner' => 3,
            'intermediate' => 4,
            'advanced' => 5,
            default => 3
        };

        $lessons = [];
        for ($i = 1; $i <= $lessonCount; $i++) {
            $lessons[] = [
                'title' => "Aula {$i}: " . $this->generateLessonTitle($moduleTitle, $i, $difficulty),
                'content' => $this->generateLessonContent($moduleTitle, $i, $difficulty),
                'duration_minutes' => $this->calculateLessonDuration($difficulty)
            ];
        }

        return $lessons;
    }

    private function generateLessonTitle($moduleTitle, $lessonNumber, $difficulty)
    {
        $templates = [
            1 => ['Introdução', 'Fundamentos', 'Conceitos Básicos'],
            2 => ['Desenvolvimento', 'Aplicação Prática', 'Exercícios'],
            3 => ['Casos Práticos', 'Exemplos Reais', 'Projeto'],
            4 => ['Técnicas Avançadas', 'Otimização', 'Melhores Práticas'],
            5 => ['Certificação', 'Projeto Final', 'Conclusão']
        ];

        $options = $templates[$lessonNumber] ?? ['Desenvolvimento'];
        return $options[array_rand($options)] . ' de ' . $moduleTitle;
    }

    private function generateLessonContent($moduleTitle, $lessonNumber, $difficulty)
    {
        $baseContent = "Nesta aula, você irá aprender sobre os aspectos fundamentais de {$moduleTitle}. ";

        $additionalContent = match($difficulty) {
            'beginner' => "Começaremos com conceitos básicos e exemplos simples para facilitar o entendimento. Ao final, você terá uma base sólida para prosseguir.",
            'intermediate' => "Abordaremos técnicas práticas e casos reais da indústria. Você desenvolverá habilidades aplicáveis no mercado de trabalho.",
            'advanced' => "Exploraremos técnicas especializadas e arquiteturas complexas. Este conteúdo é destinado a profissionais que buscam excelência técnica.",
            default => "Combinaremos teoria e prática para um aprendizado completo e eficaz."
        };

        return $baseContent . $additionalContent;
    }

    private function calculateLessonDuration($difficulty)
    {
        return match($difficulty) {
            'beginner' => 30,
            'intermediate' => 45,
            'advanced' => 60,
            default => 40
        };
    }

    private function generateIntelligentObjectives($subject, $difficulty)
    {
        $baseObjectives = [
            "Dominar os conceitos fundamentais de {$subject}",
            "Aplicar conhecimentos em situações práticas",
            "Desenvolver projetos relacionados à área"
        ];

        $advancedObjectives = [
            "Implementar soluções complexas em {$subject}",
            "Otimizar processos e metodologias",
            "Liderar projetos e equipes na área"
        ];

        $objectives = $baseObjectives;
        if ($difficulty === 'advanced') {
            $objectives = array_merge($objectives, $advancedObjectives);
        }

        return array_map(function($objective) use ($subject) {
            return str_replace('{subject}', $subject, $objective);
        }, $objectives);
    }

    private function generateIntelligentPrerequisites($difficulty)
    {
        return match($difficulty) {
            'beginner' => ['Nenhum conhecimento prévio necessário'],
            'intermediate' => ['Conhecimentos básicos na área', 'Experiência com conceitos fundamentais'],
            'advanced' => ['Experiência profissional na área', 'Conhecimento avançado de conceitos'],
            default => ['Conhecimento básico']
        };
    }

    private function generateIntelligentAssessments($difficulty)
    {
        $basic = ['Quiz interativo', 'Exercícios práticos'];
        $intermediate = ['Projetos práticos', 'Estudos de caso', 'Avaliações por pares'];
        $advanced = ['Projeto final complexo', 'Apresentação técnica', 'Peer review', 'Portfolio profissional'];

        return match($difficulty) {
            'beginner' => $basic,
            'intermediate' => array_merge($basic, $intermediate),
            'advanced' => array_merge($basic, $intermediate, $advanced),
            default => $basic
        };
    }

    /**
     * Fallback para atividades
     */
    private function getFallbackActivities($topic, $count)
    {
        $activities = [];
        for ($i = 1; $i <= $count; $i++) {
            $activities[] = [
                'title' => "Atividade {$i} sobre {$topic}",
                'type' => 'quiz',
                'description' => "Atividade prática sobre {$topic}",
                'points' => 50,
                'difficulty' => 'medium',
                'estimated_time' => 10,
                'instructions' => 'Complete esta atividade para ganhar pontos.',
                'content' => [
                    'questions' => [
                        [
                            'question' => "Qual é um conceito importante sobre {$topic}?",
                            'options' => ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
                            'correct_answer' => 0,
                            'explanation' => 'Esta é a resposta correta.'
                        ]
                    ]
                ]
            ];
        }

        return ['activities' => $activities];
    }

    /**
     * Fallback para badges
     */
    private function getFallbackBadges($courseTitle)
    {
        return [
            'badges' => [
                [
                    'name' => 'Iniciante',
                    'description' => 'Completou a primeira aula',
                    'icon' => '🌟',
                    'color' => '#4CAF50',
                    'criteria' => 'Complete a primeira aula do curso',
                    'points' => 25,
                    'rarity' => 'common'
                ],
                [
                    'name' => 'Explorador',
                    'description' => 'Completou metade do curso',
                    'icon' => '🚀',
                    'color' => '#2196F3',
                    'criteria' => 'Complete 50% das atividades',
                    'points' => 100,
                    'rarity' => 'rare'
                ]
            ]
        ];
    }

    /**
     * Fallback para canvas
     */
    private function getFallbackCanvas($topic)
    {
        return [
            'canvas' => [
                'title' => "Mapa Mental: {$topic}",
                'type' => 'mindmap',
                'elements' => [
                    [
                        'id' => 'center',
                        'type' => 'node',
                        'x' => 400,
                        'y' => 300,
                        'width' => 150,
                        'height' => 80,
                        'text' => $topic,
                        'color' => '#4A90E2',
                        'connections' => ['concept1', 'concept2']
                    ],
                    [
                        'id' => 'concept1',
                        'type' => 'node',
                        'x' => 200,
                        'y' => 200,
                        'width' => 120,
                        'height' => 60,
                        'text' => 'Conceito 1',
                        'color' => '#50C878',
                        'connections' => []
                    ],
                    [
                        'id' => 'concept2',
                        'type' => 'node',
                        'x' => 600,
                        'y' => 200,
                        'width' => 120,
                        'height' => 60,
                        'text' => 'Conceito 2',
                        'color' => '#FF6B6B',
                        'connections' => []
                    ]
                ],
                'interactions' => [
                    [
                        'element_id' => 'center',
                        'action' => 'click',
                        'response' => "Explore mais sobre {$topic}",
                        'points' => 10
                    ]
                ]
            ]
        ];
    }

    /**
     * Validar e melhorar dados do curso gerado
     */
    private function validateAndEnhanceCourse($courseData)
    {
        // Garantir campos obrigatórios
        $courseData['title'] = $courseData['title'] ?? 'Curso Gerado por IA';
        $courseData['description'] = $courseData['description'] ?? 'Curso educacional criado com inteligência artificial.';
        $courseData['duration_hours'] = $courseData['duration_hours'] ?? 10;
        $courseData['target_audience'] = $courseData['target_audience'] ?? 'Público geral';
        $courseData['difficulty'] = $courseData['difficulty'] ?? 'intermediate';

        // Validar e melhorar módulos
        if (!isset($courseData['modules']) || !is_array($courseData['modules']) || empty($courseData['modules'])) {
            $courseData['modules'] = $this->generateDefaultModules($courseData['title']);
        }

        // Melhorar cada módulo
        foreach ($courseData['modules'] as &$module) {
            $module['title'] = $module['title'] ?? 'Módulo';
            $module['description'] = $module['description'] ?? 'Descrição do módulo';

            if (!isset($module['lessons']) || !is_array($module['lessons'])) {
                $module['lessons'] = $this->generateDefaultLessons($module['title']);
            }
        }

        // Garantir objetivos e pré-requisitos
        $courseData['learning_objectives'] = $courseData['learning_objectives'] ?? [
            'Compreender os conceitos fundamentais',
            'Aplicar conhecimentos práticos',
            'Desenvolver habilidades específicas da área'
        ];

        $courseData['prerequisites'] = $courseData['prerequisites'] ?? ['Conhecimento básico'];
        $courseData['assessment_methods'] = $courseData['assessment_methods'] ?? ['Quiz', 'Exercícios práticos'];

        return $courseData;
    }

    /**
     * Gerar módulos padrão quando IA falha
     */
    private function generateDefaultModules($courseTitle)
    {
        return [
            [
                'title' => 'Introdução ao ' . $courseTitle,
                'description' => 'Fundamentos e conceitos básicos',
                'lessons' => $this->generateDefaultLessons('Introdução')
            ],
            [
                'title' => 'Desenvolvimento Prático',
                'description' => 'Aplicação dos conceitos aprendidos',
                'lessons' => $this->generateDefaultLessons('Prática')
            ],
            [
                'title' => 'Avançado e Aplicações',
                'description' => 'Tópicos avançados e casos práticos',
                'lessons' => $this->generateDefaultLessons('Avançado')
            ]
        ];
    }

    /**
     * Gerar aulas padrão para módulos
     */
    private function generateDefaultLessons($moduleTitle)
    {
        return [
            [
                'title' => 'Conceitos de ' . $moduleTitle,
                'content' => 'Nesta aula abordaremos os conceitos fundamentais relacionados a ' . $moduleTitle . '.',
                'duration_minutes' => 30
            ],
            [
                'title' => 'Exercícios de ' . $moduleTitle,
                'content' => 'Vamos praticar com exercícios específicos sobre ' . $moduleTitle . '.',
                'duration_minutes' => 45
            ]
        ];
    }

    /**
     * Validar qualidade do conteúdo gerado
     */
    private function validateContentQuality($content, $type = 'course')
    {
        $issues = [];

        switch ($type) {
            case 'course':
                $issues = array_merge($issues, $this->validateCourseQuality($content));
                break;
            case 'activities':
                $issues = array_merge($issues, $this->validateActivitiesQuality($content));
                break;
            case 'badges':
                $issues = array_merge($issues, $this->validateBadgesQuality($content));
                break;
        }

        return [
            'is_valid' => empty($issues),
            'quality_score' => $this->calculateQualityScore($content, $issues),
            'issues' => $issues,
            'suggestions' => $this->getImprovementSuggestions($issues)
        ];
    }

    private function validateCourseQuality($course)
    {
        $issues = [];

        // Validar título
        if (empty($course['title']) || strlen($course['title']) < 10) {
            $issues[] = 'Título muito curto ou vazio';
        }

        if (strpos(strtolower($course['title']), 'curso sobre curso') !== false) {
            $issues[] = 'Título repetitivo ou mal formatado';
        }

        // Validar módulos
        if (!isset($course['modules']) || count($course['modules']) < 2) {
            $issues[] = 'Poucos módulos (mínimo 2)';
        }

        if (isset($course['modules'])) {
            foreach ($course['modules'] as $module) {
                if (!isset($module['lessons']) || count($module['lessons']) < 2) {
                    $issues[] = 'Módulo com poucas aulas: ' . ($module['title'] ?? 'Sem título');
                }
            }
        }

        // Validar objetivos
        if (!isset($course['learning_objectives']) || count($course['learning_objectives']) < 3) {
            $issues[] = 'Poucos objetivos de aprendizagem';
        }

        return $issues;
    }

    private function validateActivitiesQuality($activities)
    {
        $issues = [];

        if (!isset($activities['activities']) || empty($activities['activities'])) {
            $issues[] = 'Nenhuma atividade gerada';
            return $issues;
        }

        foreach ($activities['activities'] as $index => $activity) {
            $activityNum = $index + 1;

            // Verificar títulos repetitivos
            if (preg_match('/^Atividade \d+ sobre/', $activity['title'] ?? '')) {
                $issues[] = "Atividade {$activityNum}: Título genérico e repetitivo";
            }

            // Verificar conteúdo das questões
            if (isset($activity['content']['questions'])) {
                foreach ($activity['content']['questions'] as $qIndex => $question) {
                    if (empty($question['explanation']) || strlen($question['explanation']) < 20) {
                        $issues[] = "Atividade {$activityNum}: Explicação insuficiente na questão " . ($qIndex + 1);
                    }
                }
            }
        }

        return $issues;
    }

    private function validateBadgesQuality($badges)
    {
        $issues = [];

        if (!isset($badges['badges']) || count($badges['badges']) < 3) {
            $issues[] = 'Poucas badges geradas (mínimo 3)';
        }

        if (isset($badges['badges'])) {
            $names = array_column($badges['badges'], 'name');
            if (count($names) !== count(array_unique($names))) {
                $issues[] = 'Badges com nomes duplicados';
            }

            foreach ($badges['badges'] as $badge) {
                if (in_array($badge['name'] ?? '', ['Iniciante', 'Explorador', 'Mestre'])) {
                    $issues[] = 'Badge com nome muito genérico: ' . ($badge['name'] ?? '');
                }
            }
        }

        return $issues;
    }

    private function calculateQualityScore($content, $issues)
    {
        $baseScore = 100;
        $deduction = count($issues) * 15; // 15 pontos por issue

        return max(0, min(100, $baseScore - $deduction));
    }

    private function getImprovementSuggestions($issues)
    {
        $suggestions = [];

        foreach ($issues as $issue) {
            if (strpos($issue, 'Título') !== false) {
                $suggestions[] = 'Reformule o título para ser mais específico e atrativo';
            } elseif (strpos($issue, 'Poucos módulos') !== false) {
                $suggestions[] = 'Adicione mais módulos para cobrir o conteúdo adequadamente';
            } elseif (strpos($issue, 'repetitivo') !== false) {
                $suggestions[] = 'Diversifique títulos e descrições para evitar repetição';
            }
        }

        return array_unique($suggestions);
    }

    /**
     * Construir prompt para geração de curso a partir de conteúdo
     */
    private function buildCourseFromContentPrompt($content, $title, $targetAudience, $difficulty)
    {
        $audienceText = $targetAudience ? "para {$targetAudience}" : "para público geral";
        $difficultyMap = [
            'beginner' => 'iniciante',
            'intermediate' => 'intermediário',
            'advanced' => 'avançado'
        ];
        $difficultyText = $difficultyMap[$difficulty] ?? 'intermediário';

        // Gemini 2.5 Flash suporta contexto maior - usar até 15000 chars
        $limitedContent = mb_substr($content, 0, 15000);

        return "Você é um EXPERT COURSE DESIGNER especializado em criar cursos COMPLETOS e ESTRUTURADOS.

🎯 MISSÃO: Criar curso COMPLETO '{$title}' nível {$difficultyText} {$audienceText}

📄 CONTEÚDO DO MATERIAL:
{$limitedContent}

🎓 REQUISITOS OBRIGATÓRIOS:
✓ Criar NO MÍNIMO 3-5 módulos progressivos
✓ Cada módulo com 3-5 lições bem estruturadas
✓ Lições de 8-15 minutos (micro-learning)
✓ Usar CONTEÚDO REAL extraído do material
✓ Descrições ESPECÍFICAS baseadas no documento
✓ Objetivos de aprendizado CLAROS para cada lição
✓ Tipos variados: lesson, reading, quiz, assignment
✓ Pontuação balanceada: lições (10-15 pts), quizzes (20-25 pts)

📝 FORMATAÇÃO DO CONTEÚDO (OBRIGATÓRIO):
✓ Usar HTML SEMÂNTICO estruturado
✓ Títulos: <h2> para seções principais, <h3> para subseções
✓ Parágrafos: <p> bem espaçados e informativos
✓ Conceitos importantes: <strong>destacar com negrito</strong>
✓ Termos técnicos: <em>marcar em itálico</em>
✓ Listas: <ul> ou <ol> para enumerar pontos
✓ Dicas/Avisos: <blockquote>💡 Informação relevante</blockquote>
✓ Tabelas: usar <table> para comparações e dados estruturados
✓ Ícones: usar emojis para visual (📊 📈 💡 ⚠️ ✅ ❌)
✓ Conteúdo MÍNIMO: 800 caracteres por lição (rico e detalhado)

🎨 EXEMPLO DE ESTRUTURA HTML:

<h2>📚 Título da Seção Principal</h2>
<p>Parágrafo introdutório explicando o conceito de forma clara.</p>

<h3>Conceitos Fundamentais</h3>
<p>A <strong>seleção de pessoal</strong> é um processo crítico que envolve múltiplas etapas. O objetivo principal é <em>identificar candidatos qualificados</em> através de métodos estruturados.</p>

<blockquote>💡 <strong>Importante:</strong> A entrevista continua sendo o método mais utilizado, aparecendo em 95% dos processos seletivos.</blockquote>

<h3>📊 Comparação de Métodos</h3>
<table>
<thead>
<tr><th>Método</th><th>Vantagens</th><th>Desvantagens</th></tr>
</thead>
<tbody>
<tr>
<td><strong>Entrevista</strong></td>
<td>✅ Alto engajamento<br>✅ Flexível</td>
<td>❌ Subjetiva<br>❌ Viés potencial</td>
</tr>
<tr>
<td><strong>Testes</strong></td>
<td>✅ Objetiva<br>✅ Padronizada</td>
<td>❌ Limitada<br>❌ Ansiedade</td>
</tr>
</tbody>
</table>

<h3>Pontos-Chave para Memorização</h3>
<ul>
<li><strong>Primeiro ponto importante:</strong> descrição detalhada</li>
<li><strong>Segundo ponto crítico:</strong> explicação com exemplo</li>
<li><strong>Terceiro conceito essencial:</strong> aplicação prática</li>
</ul>

<blockquote>⚠️ <strong>Atenção:</strong> Este conceito frequentemente aparece em avaliações!</blockquote>

📝 RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO (sem markdown, sem comentários):

{
  \"title\": \"{$title}\",
  \"description\": \"Descrição completa do curso baseada no conteúdo real\",
  \"difficulty\": \"{$difficulty}\",
  \"estimated_hours\": 8,
  \"points_per_completion\": 100,
  \"modules\": [
    {
      \"title\": \"Título do módulo baseado no conteúdo\",
      \"description\": \"Descrição específica do que será aprendido\",
      \"order\": 1,
      \"lessons\": [
        {
          \"title\": \"Título específico da lição\",
          \"content\": \"Conteúdo RICO em HTML semântico com <h2>, <h3>, <p>, <strong>, <em>, <ul>, <table>, <blockquote> e emojis (mínimo 800 caracteres)\",
          \"duration_minutes\": 10,
          \"type\": \"lesson\",
          \"points\": 15,
          \"objectives\": [\"Objetivo 1\", \"Objetivo 2\"]
        },
        {
          \"title\": \"Quiz - Verificação de Conhecimento\",
          \"content\": \"Quiz baseado no conteúdo anterior\",
          \"duration_minutes\": 15,
          \"type\": \"quiz\",
          \"points\": 25,
          \"required_score\": 70
        }
      ]
    }
  ]
}

IMPORTANTE: Use o CONTEÚDO REAL fornecido. Não invente informações genéricas!";
    }

    /**
     * Aplicar regras de Gates de Progressão e Micro-learning
     */
    private function applyGameProgressionRules($courseData)
    {
        if (!isset($courseData['modules']) || !is_array($courseData['modules'])) {
            return $courseData;
        }

        $lessonCount = 0;

        foreach ($courseData['modules'] as $moduleIndex => &$module) {
            if (!isset($module['lessons']) || !is_array($module['lessons'])) {
                continue;
            }

            $newLessons = [];

            foreach ($module['lessons'] as $lessonIndex => $lesson) {
                // Aplicar micro-learning: forçar 5-15 minutos
                if (!isset($lesson['duration_minutes']) || $lesson['duration_minutes'] == 0) {
                    $lesson['duration_minutes'] = rand(5, 15);
                }

                // Garantir que está no range de micro-learning
                if ($lesson['duration_minutes'] > 15) {
                    $lesson['duration_minutes'] = 15;
                } elseif ($lesson['duration_minutes'] < 5) {
                    $lesson['duration_minutes'] = 5;
                }

                $newLessons[] = $lesson;
                $lessonCount++;

                // Gate de Progressão: Quiz a cada 4 lições
                if ($lessonCount % 4 == 0 && $lesson['type'] !== 'quiz') {
                    $quizLesson = [
                        'title' => 'Quiz - Verificação de Progresso',
                        'content' => 'Quiz para verificar o aprendizado das últimas 4 lições',
                        'duration_minutes' => 15,
                        'type' => 'quiz',
                        'points' => 25,
                        'required_score' => 70, // 70% mínimo para prosseguir
                        'questions' => $this->generateQuizQuestions($lesson['content'] ?? 'Conteúdo')
                    ];

                    $newLessons[] = $quizLesson;
                }
            }

            $module['lessons'] = $newLessons;
        }

        Log::info('🎯 Regras de gamificação aplicadas', [
            'total_lessons' => $lessonCount,
            'quizzes_added' => floor($lessonCount / 4),
            'micro_learning_enforced' => true
        ]);

        return $courseData;
    }

    /**
     * Gerar questões de quiz básicas
     */
    private function generateQuizQuestions($content)
    {
        return [
            [
                'question' => 'Com base no conteúdo estudado, qual é o conceito mais importante?',
                'options' => [
                    'Conceito A - Fundamental',
                    'Conceito B - Secundário',
                    'Conceito C - Complementar',
                    'Conceito D - Opcional'
                ],
                'correct' => 0,
                'explanation' => 'O conceito A é fundamental pois estabelece a base para todo o aprendizado.'
            ],
            [
                'question' => 'Qual é a aplicação prática do que foi aprendido?',
                'options' => [
                    'Aplicação teórica apenas',
                    'Aplicação prática em projetos reais',
                    'Aplicação limitada',
                    'Não há aplicação'
                ],
                'correct' => 1,
                'explanation' => 'O conteúdo sempre visa aplicação prática em situações reais.'
            ]
        ];
    }

    /**
     * Melhorar curso com conteúdo real extraído
     */
    private function enhanceWithRealContent($courseData, $extractedContent)
    {
        // Por enquanto, apenas garantir que o conteúdo está sendo usado
        // Em versões futuras, fazer análise mais sofisticada do conteúdo

        Log::info('🚀 Melhorando curso com conteúdo real', [
            'content_chars' => strlen($extractedContent),
            'modules_count' => count($courseData['modules'] ?? [])
        ]);

        return $courseData;
    }

    /**
     * Contar atividades no curso
     */
    private function countActivities($courseData)
    {
        $count = 0;
        if (isset($courseData['modules'])) {
            foreach ($courseData['modules'] as $module) {
                if (isset($module['lessons'])) {
                    $count += count($module['lessons']);
                }
            }
        }
        return $count;
    }

    /**
     * Fallback melhorado para curso baseado em conteúdo
     */
    private function getEnhancedFallbackCourseFromContent($content, $title, $targetAudience, $difficulty)
    {
        Log::info('🔄 Usando fallback melhorado para curso com conteúdo');

        return [
            'title' => $title,
            'description' => "Curso baseado no material fornecido: " . substr($content, 0, 100) . "...",
            'difficulty' => $difficulty,
            'estimated_hours' => 6,
            'points_per_completion' => 100,
            'modules' => [
                [
                    'title' => 'Introdução ao ' . $title,
                    'description' => 'Módulo introdutório baseado no conteúdo fornecido',
                    'lessons' => [
                        [
                            'title' => 'Conceitos Fundamentais',
                            'content' => 'Introdução aos conceitos apresentados no material: ' . substr($content, 0, 200),
                            'duration_minutes' => 10,
                            'type' => 'lesson',
                            'points' => 15
                        ],
                        [
                            'title' => 'Aprofundamento',
                            'content' => 'Detalhamento dos conceitos do material original',
                            'duration_minutes' => 12,
                            'type' => 'lesson',
                            'points' => 15
                        ],
                        [
                            'title' => 'Aplicação Prática',
                            'content' => 'Exercícios práticos baseados no conteúdo',
                            'duration_minutes' => 8,
                            'type' => 'assignment',
                            'points' => 20
                        ],
                        [
                            'title' => 'Quiz - Verificação',
                            'content' => 'Quiz para verificar o aprendizado',
                            'duration_minutes' => 15,
                            'type' => 'quiz',
                            'points' => 25,
                            'required_score' => 70,
                            'questions' => $this->generateQuizQuestions($content)
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * Registrar uso da API Gemini
     */
    private function logUsage($action, $inputTokens = null, $outputTokens = null)
    {
        // Calcular custos com base na tabela de preços do Gemini
        $inputCost = ($inputTokens / 1000000) * 0.50;
        $outputCost = ($outputTokens / 1000000) * 1.50;
        $totalCost = $inputCost + $outputCost;

        // Obter tenant_id usando helper do sistema
        $tenantId = tenant_id();

        // Se não houver tenant (domínio central), tentar pegar do usuário
        if (!$tenantId && auth()->check()) {
            $tenantId = auth()->user()->tenant_id ?? null;
        }

        // Só registrar se tiver tenant_id (obrigatório pela FK)
        if ($tenantId) {
            \App\Models\AiUsageLog::create([
                'tenant_id' => $tenantId,
                'user_id' => auth()->id() ?? null,
                'action' => $action,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_usd' => $totalCost,
                'model' => 'gemini-2.5-flash-preview'
            ]);

            Log::info('API Gemini: Uso registrado', [
                'tenant_id' => $tenantId,
                'action' => $action,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_usd' => round($totalCost, 6)
            ]);
        }
    }
}