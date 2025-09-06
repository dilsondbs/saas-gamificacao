<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Activity;
use App\Models\Badge;
use App\Models\CourseMaterial;
use App\Services\MaterialContentExtractor;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AICourseGeneratorService
{
    protected $contentExtractor;
    private $client;
    private $apiKey;
    private $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    public function __construct()
    {
        $this->contentExtractor = new MaterialContentExtractor();
        $this->client = new Client();
        $this->apiKey = config('services.gemini.api_key');
    }

    public function generateCourseFromMaterial(CourseMaterial $material, Course $course)
    {
        Log::info('AI Course Generation started', [
            'material_id' => $material->id,
            'course_id' => $course->id,
            'file_type' => $material->file_type
        ]);

        try {
            // 1. Extrair conteúdo real do material
            $extractedContent = $this->contentExtractor->extractContent($material);
            
            // 2. Analisar o material usando conteúdo real
            $analysis = $this->analyzeMaterial($material, $extractedContent);
            
            // 3. Gerar estrutura do curso baseada no conteúdo real
            $courseStructure = $this->generateCourseStructure($analysis, $extractedContent);
            
            // 4. Criar atividades com conteúdo real
            $activities = $this->createActivities($course, $courseStructure, $material);
            
            // 5. Criar badges específicos
            $badges = $this->createCourseBadges($course, $courseStructure);
            
            Log::info('AI Course Generation completed', [
                'activities_created' => count($activities),
                'badges_created' => count($badges),
                'content_sections' => count($extractedContent['sections']),
                'total_words' => $extractedContent['word_count']
            ]);
            
            return [
                'success' => true,
                'activities' => $activities,
                'badges' => $badges,
                'structure' => $courseStructure,
                'extracted_content' => $extractedContent
            ];
            
        } catch (\Exception $e) {
            Log::error('AI Course Generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function analyzeMaterial(CourseMaterial $material, $extractedContent = null)
    {
        $fileName = strtolower($material->original_name);
        $fileType = $material->file_type;
        
        // Detectar assunto baseado no nome do arquivo e conteúdo extraído
        $subject = $this->detectSubject($fileName, $extractedContent);
        
        // Analisar conteúdo real se disponível
        if ($extractedContent && !empty($extractedContent['sections'])) {
            $realTopics = $this->extractTopicsFromContent($extractedContent);
            $contentComplexity = $this->analyzeContentComplexity($extractedContent);
        } else {
            $realTopics = $this->extractMainTopics($subject);
            $contentComplexity = 'medium';
        }
        
        $analysis = [
            'subject' => $subject,
            'estimated_duration' => $this->estimateCourseDuration($extractedContent),
            'difficulty_level' => $this->calculateDifficulty($fileName, $contentComplexity),
            'main_topics' => $realTopics,
            'learning_objectives' => $this->generateLearningObjectives($subject),
            'file_size' => $material->file_size,
            'file_type' => $fileType,
            'content_stats' => $extractedContent ? [
                'word_count' => $extractedContent['word_count'],
                'sections_count' => count($extractedContent['sections']),
                'estimated_reading_time' => $extractedContent['estimated_reading_time']
            ] : null
        ];
        
        Log::info('Material analysis completed', $analysis);
        
        return $analysis;
    }

    private function detectSubject($fileName, $extractedContent = null)
    {
        $subjects = [
            'neuroanatomia' => 'Neuroanatomia',
            'anatomia' => 'Anatomia Humana',
            'fisiologia' => 'Fisiologia',
            'biologia' => 'Biologia',
            'quimica' => 'Química',
            'fisica' => 'Física',
            'matematica' => 'Matemática',
            'programacao' => 'Programação',
            'laravel' => 'Desenvolvimento Laravel',
            'php' => 'Programação PHP',
            'javascript' => 'JavaScript',
            'marketing' => 'Marketing Digital',
            'gestao' => 'Gestão Empresarial',
        ];

        // Primeiro, verificar nome do arquivo
        foreach ($subjects as $keyword => $subject) {
            if (str_contains($fileName, $keyword)) {
                return $subject;
            }
        }

        // Se tem conteúdo extraído, analisar texto também
        if ($extractedContent && !empty($extractedContent['clean_text'])) {
            $text = strtolower($extractedContent['clean_text']);
            
            $subjectScores = [];
            foreach ($subjects as $keyword => $subject) {
                $count = substr_count($text, $keyword);
                if ($count > 0) {
                    $subjectScores[$subject] = $count;
                }
            }
            
            if (!empty($subjectScores)) {
                return array_key_first($subjectScores);
            }
        }

        return 'Curso Geral';
    }

    private function extractTopicsFromContent($extractedContent)
    {
        $topics = [];
        
        // Usar títulos das seções como tópicos se disponíveis
        if (!empty($extractedContent['sections'])) {
            foreach ($extractedContent['sections'] as $section) {
                $topics[] = $section['title'];
            }
        }
        
        // Se não tem seções suficientes, usar tópicos padrão
        if (count($topics) < 3) {
            return [
                'Conceitos Fundamentais',
                'Teoria Básica', 
                'Aplicação Prática',
                'Estudos de Caso',
                'Exercícios',
                'Avaliação Final'
            ];
        }
        
        return array_slice($topics, 0, 8); // Máximo 8 tópicos
    }

    private function analyzeContentComplexity($extractedContent)
    {
        if (!$extractedContent || $extractedContent['word_count'] < 100) {
            return 'low';
        }
        
        $text = $extractedContent['clean_text'];
        $complexity = 'medium';
        
        // Indicadores de complexidade
        $complexWords = [
            'metodologia', 'paradigma', 'epistemologia', 'hermenêutica',
            'algoritmo', 'framework', 'arquitetura', 'implementação',
            'diagnóstico', 'prognóstico', 'patologia', 'etiologia'
        ];
        
        $complexCount = 0;
        foreach ($complexWords as $word) {
            if (str_contains(strtolower($text), $word)) {
                $complexCount++;
            }
        }
        
        if ($complexCount > 5) {
            $complexity = 'high';
        } elseif ($complexCount < 2) {
            $complexity = 'low';
        }
        
        return $complexity;
    }

    private function estimateCourseDuration($extractedContent)
    {
        if (!$extractedContent || $extractedContent['word_count'] < 500) {
            return rand(2, 4) . ' semanas';
        }
        
        $readingTime = $extractedContent['estimated_reading_time'];
        $weeks = max(2, min(12, intval($readingTime / 60) + 2)); // Base no tempo de leitura
        
        return $weeks . ' semanas';
    }

    private function calculateDifficulty($fileName)
    {
        $advanced_keywords = ['avancado', 'master', 'expert', 'profissional'];
        $intermediate_keywords = ['intermediario', 'medio', 'pratico'];
        
        foreach ($advanced_keywords as $keyword) {
            if (str_contains($fileName, $keyword)) {
                return 'Avançado';
            }
        }
        
        foreach ($intermediate_keywords as $keyword) {
            if (str_contains($fileName, $keyword)) {
                return 'Intermediário';
            }
        }
        
        return 'Iniciante';
    }

    private function extractMainTopics($subject)
    {
        $topicsBySubject = [
            'Neuroanatomia' => [
                'Sistema Nervoso Central',
                'Sistema Nervoso Periférico',
                'Neurônios e Sinapses',
                'Medula Espinhal',
                'Tronco Encefálico',
                'Cerebelo',
                'Diencéfalo',
                'Telencéfalo'
            ],
            'Anatomia Humana' => [
                'Sistema Esquelético',
                'Sistema Muscular',
                'Sistema Cardiovascular',
                'Sistema Respiratório',
                'Sistema Digestivo',
                'Sistema Nervoso'
            ],
            'Programação' => [
                'Variáveis e Tipos',
                'Estruturas de Controle',
                'Funções e Métodos',
                'Orientação a Objetos',
                'Bancos de Dados',
                'APIs e Integração'
            ],
            'default' => [
                'Conceitos Fundamentais',
                'Teoria Básica',
                'Aplicação Prática',
                'Estudos de Caso',
                'Exercícios',
                'Avaliação Final'
            ]
        ];

        return $topicsBySubject[$subject] ?? $topicsBySubject['default'];
    }

    private function generateLearningObjectives($subject)
    {
        return [
            "Compreender os conceitos fundamentais de {$subject}",
            "Aplicar conhecimentos teóricos em situações práticas",
            "Analisar casos reais relacionados ao tema",
            "Desenvolver habilidades críticas na área",
            "Dominar as principais técnicas e metodologias"
        ];
    }

    private function generateCourseStructure($analysis, $extractedContent = null)
    {
        $topics = $analysis['main_topics'];
        $structure = [];

        foreach ($topics as $index => $topic) {
            // Buscar conteúdo específico para este tópico se disponível
            $topicContent = null;
            if ($extractedContent && !empty($extractedContent['sections'])) {
                $topicContent = $this->findContentForTopic($topic, $extractedContent['sections']);
            }

            $structure[] = [
                'module_number' => $index + 1,
                'title' => $topic,
                'description' => $topicContent 
                    ? "Módulo baseado no conteúdo: " . substr($topicContent['content'], 0, 100) . "..."
                    : "Módulo abrangente sobre {$topic}",
                'activities' => $this->generateActivitiesForTopic($topic, $index + 1),
                'estimated_time' => $topicContent 
                    ? $this->estimateModuleTime($topicContent) 
                    : rand(3, 8) . ' horas',
                'content_section' => $topicContent
            ];
        }

        return $structure;
    }

    private function findContentForTopic($topicTitle, $sections)
    {
        // Procurar seção com título similar
        foreach ($sections as $section) {
            $similarity = similar_text(
                strtolower($topicTitle), 
                strtolower($section['title'])
            );
            
            if ($similarity > 3) {
                return $section;
            }
        }
        
        // Se não encontrou, pegar próxima seção disponível
        static $usedSections = [];
        foreach ($sections as $index => $section) {
            if (!in_array($index, $usedSections) && $section['word_count'] > 20) {
                $usedSections[] = $index;
                return $section;
            }
        }
        
        return null;
    }

    private function estimateModuleTime($contentSection)
    {
        $readingMinutes = max(5, intval($contentSection['word_count'] / 200 * 60)); // 200 palavras por minuto
        $totalMinutes = $readingMinutes + 30; // + tempo para atividades
        
        $hours = intval($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        
        if ($hours > 0) {
            return $hours . 'h' . ($minutes > 0 ? ' ' . $minutes . 'min' : '');
        } else {
            return $minutes . ' min';
        }
    }

    private function generateActivitiesForTopic($topic, $moduleNumber)
    {
        return [
            [
                'type' => 'reading',
                'title' => "Leitura: Introdução a {$topic}",
                'description' => "Material introdutório sobre os conceitos fundamentais de {$topic}",
                'points' => 10,
                'duration' => rand(15, 30) // 15-30 minutos para leitura
            ],
            [
                'type' => 'quiz',
                'title' => "Quiz: {$topic}",
                'description' => "Teste seus conhecimentos sobre {$topic}",
                'points' => 20,
                'duration' => rand(10, 20), // 10-20 minutos para quiz
                'questions' => $this->generateQuizQuestions($topic)
            ],
            [
                'type' => 'assignment',
                'title' => "Exercício Prático: {$topic}",
                'description' => "Atividade prática para aplicação dos conceitos de {$topic}",
                'points' => 30,
                'duration' => rand(30, 60) // 30-60 minutos para exercício prático
            ]
        ];
    }

    private function generateQuizQuestions($topic)
    {
        // Gerar questões baseadas no tópico
        $questionTemplates = [
            "Qual é o conceito principal de {$topic}?",
            "Como {$topic} se relaciona com outras áreas?",
            "Quais são as principais características de {$topic}?",
            "Em que situações {$topic} é mais aplicável?",
            "Qual a importância de {$topic} no contexto geral?"
        ];

        $questions = [];
        foreach (array_slice($questionTemplates, 0, 3) as $template) {
            $questions[] = [
                'question' => $template,
                'options' => [
                    'Opção A - Conceito básico',
                    'Opção B - Conceito intermediário', 
                    'Opção C - Conceito avançado',
                    'Opção D - Todas as anteriores'
                ],
                'correct_answer' => 'D'
            ];
        }

        return $questions;
    }

    private function createActivities(Course $course, array $courseStructure, $material = null)
    {
        $createdActivities = [];

        foreach ($courseStructure as $module) {
            foreach ($module['activities'] as $activityData) {
                // Preparar conteúdo da atividade com dados reais
                $activityContent = [
                    'module' => $module['title'],
                    'questions' => $activityData['questions'] ?? [],
                    'instructions' => $activityData['description'],
                    'material_id' => $material ? $material->id : null
                ];

                // Se há conteúdo real da seção, adicionar
                if (isset($module['content_section']) && $module['content_section']) {
                    $activityContent['real_content'] = [
                        'title' => $module['content_section']['title'],
                        'content' => $module['content_section']['content'],
                        'word_count' => $module['content_section']['word_count']
                    ];
                }

                $activity = Activity::create([
                    'course_id' => $course->id,
                    'title' => $activityData['title'],
                    'description' => $activityData['description'],
                    'type' => $activityData['type'],
                    'content' => $activityContent, // Stored as JSON automatically
                    'points_value' => $activityData['points'],
                    'duration_minutes' => $activityData['duration'] ?? 30,
                    'is_required' => true,
                    'is_active' => true,
                    'order' => count($createdActivities) + 1
                ]);

                $createdActivities[] = $activity;
            }
        }

        return $createdActivities;
    }

    private function createCourseBadges(Course $course, array $courseStructure)
    {
        $createdBadges = [];

        // Badge de início
        $startBadge = Badge::create([
            'name' => "Iniciante em " . $course->title,
            'description' => "Complete a primeira atividade do curso " . $course->title,
            'icon' => '🌟',
            'color' => '#10B981',
            'type' => 'completion',
            'criteria' => json_encode([
                'course_id' => $course->id,
                'activities_completed' => 1
            ]),
            'points_value' => 50,
            'is_active' => true
        ]);
        $createdBadges[] = $startBadge;

        // Badge de meio curso
        $midBadge = Badge::create([
            'name' => "Progredindo em " . $course->title,
            'description' => "Complete 50% das atividades do curso " . $course->title,
            'icon' => '🚀',
            'color' => '#3B82F6',
            'type' => 'completion',
            'criteria' => json_encode([
                'course_id' => $course->id,
                'activities_completed' => ceil(count($courseStructure) * 3 / 2) // 50% das atividades
            ]),
            'points_value' => 100,
            'is_active' => true
        ]);
        $createdBadges[] = $midBadge;

        // Badge de conclusão
        $completionBadge = Badge::create([
            'name' => "Mestre em " . $course->title,
            'description' => "Complete todas as atividades do curso " . $course->title,
            'icon' => '🏆',
            'color' => '#F59E0B',
            'type' => 'completion',
            'criteria' => json_encode([
                'course_id' => $course->id,
                'course_completed' => true
            ]),
            'points_value' => 200,
            'is_active' => true
        ]);
        $createdBadges[] = $completionBadge;

        return $createdBadges;
    }

    public function generateCourseFromContent(string $content, int $instructorId): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Gemini API key not configured');
        }

        if (!$this->validateContentSize($content)) {
            throw new \Exception('Content exceeds 50KB limit');
        }

        $prompt = $this->buildCourseGenerationPrompt($content);
        
        try {
            $response = $this->callGeminiAPI($prompt);
            $courseData = $this->parseCourseResponse($response);
            $courseData['instructor_id'] = $instructorId;
            
            return $this->createCourseFromAIData($courseData);
        } catch (RequestException $e) {
            Log::error('Gemini API Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate course content: ' . $e->getMessage());
        }
    }

    public function buildCourseGenerationPrompt(string $content): string
    {
        return "Você é um assistente especializado em criar cursos educacionais estruturados. 
        Analise o conteúdo fornecido e crie um curso completo com a seguinte estrutura JSON:

        {
            \"title\": \"Título do curso (máximo 100 caracteres)\",
            \"description\": \"Descrição detalhada do curso (máximo 500 caracteres)\",
            \"points_per_completion\": 100,
            \"modules\": [
                {
                    \"title\": \"Nome do módulo\",
                    \"description\": \"Descrição do módulo\",
                    \"order\": 1,
                    \"activities\": [
                        {
                            \"title\": \"Nome da atividade\",
                            \"type\": \"quiz\",
                            \"description\": \"Descrição da atividade\",
                            \"content\": \"Conteúdo detalhado da atividade\",
                            \"points\": 10,
                            \"order\": 1,
                            \"duration_minutes\": 30,
                            \"questions\": [
                                {
                                    \"question\": \"Pergunta do quiz\",
                                    \"type\": \"multiple_choice\",
                                    \"options\": [\"A\", \"B\", \"C\", \"D\"],
                                    \"correct_answer\": \"A\",
                                    \"explanation\": \"Explicação da resposta\"
                                }
                            ]
                        },
                        {
                            \"title\": \"Nome da atividade de leitura\",
                            \"type\": \"reading\",
                            \"description\": \"Descrição da atividade\",
                            \"content\": \"Texto do material de leitura baseado no conteúdo fornecido\",
                            \"points\": 15,
                            \"order\": 2,
                            \"duration_minutes\": 45
                        },
                        {
                            \"title\": \"Exercício prático\",
                            \"type\": \"assignment\",
                            \"description\": \"Descrição do exercício\",
                            \"content\": \"Instruções detalhadas do exercício prático\",
                            \"points\": 25,
                            \"order\": 3,
                            \"duration_minutes\": 60
                        }
                    ]
                }
            ]
        }

        REGRAS IMPORTANTES:
        - Crie 2-4 módulos baseados no conteúdo fornecido
        - Cada módulo deve ter 2-5 atividades (mix de quiz, reading, assignment)
        - Para atividades tipo 'quiz', inclua 3-5 perguntas de múltipla escolha com 4 opções cada
        - Para atividades tipo 'reading', use trechos relevantes do conteúdo fornecido
        - Para atividades tipo 'assignment', crie exercícios práticos relacionados ao conteúdo
        - Use português brasileiro
        - Mantenha consistência pedagógica e progressão lógica
        - Total de pontos por módulo deve ser entre 50-100 pontos
        - RETORNE APENAS O JSON, sem texto adicional ou markdown

        CONTEÚDO A ANALISAR:
        " . $content;
    }

    public function callGeminiAPI(string $prompt): string
    {
        $url = $this->baseUrl . '?key=' . $this->apiKey;
        
        $requestBody = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 8192,
            ]
        ];

        $response = $this->client->post($url, [
            'json' => $requestBody,
            'headers' => [
                'Content-Type' => 'application/json',
            ]
        ]);

        $body = json_decode($response->getBody(), true);
        
        if (!isset($body['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Invalid response from Gemini API');
        }

        return $body['candidates'][0]['content']['parts'][0]['text'];
    }

    public function parseCourseResponse(string $response): array
    {
        $response = trim($response);
        
        // Remove markdown code blocks if present
        $response = preg_replace('/```json\s*/', '', $response);
        $response = preg_replace('/```\s*$/', '', $response);
        
        $courseData = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse AI response as JSON: ' . json_last_error_msg());
        }

        return $this->validateCourseStructure($courseData);
    }

    private function validateCourseStructure(array $courseData): array
    {
        $requiredFields = ['title', 'description', 'modules'];
        
        foreach ($requiredFields as $field) {
            if (!isset($courseData[$field])) {
                throw new \Exception("Missing required field: $field");
            }
        }

        // Set default values
        $courseData['points_per_completion'] = $courseData['points_per_completion'] ?? 100;
        $courseData['status'] = 'draft';

        // Validate modules
        if (!is_array($courseData['modules']) || empty($courseData['modules'])) {
            throw new \Exception('Course must have at least one module');
        }

        foreach ($courseData['modules'] as $index => &$module) {
            $module['order'] = $index + 1;
            
            if (!isset($module['activities']) || !is_array($module['activities'])) {
                $module['activities'] = [];
            }

            foreach ($module['activities'] as $actIndex => &$activity) {
                $activity['order'] = $actIndex + 1;
                $activity['points'] = $activity['points'] ?? 10;
                $activity['type'] = $activity['type'] ?? 'reading';
                $activity['duration_minutes'] = $activity['duration_minutes'] ?? 30;
            }
        }

        return $courseData;
    }

    private function createCourseFromAIData(array $courseData): array
    {
        // Create the course
        $course = Course::create([
            'title' => $courseData['title'],
            'description' => $courseData['description'],
            'points_per_completion' => $courseData['points_per_completion'],
            'instructor_id' => $courseData['instructor_id'],
            'status' => 'draft'
        ]);

        $createdActivities = [];
        $activityOrder = 1;

        // Create activities from modules
        foreach ($courseData['modules'] as $module) {
            foreach ($module['activities'] as $activityData) {
                $activity = Activity::create([
                    'course_id' => $course->id,
                    'title' => $activityData['title'],
                    'description' => $activityData['description'],
                    'type' => $activityData['type'],
                    'content' => [
                        'module' => $module['title'],
                        'content' => $activityData['content'],
                        'questions' => $activityData['questions'] ?? [],
                        'instructions' => $activityData['description']
                    ],
                    'points_value' => $activityData['points'],
                    'duration_minutes' => $activityData['duration_minutes'],
                    'is_required' => true,
                    'is_active' => true,
                    'order' => $activityOrder++
                ]);

                $createdActivities[] = $activity;
            }
        }

        // Create badges for the course
        $badges = $this->createCourseBadges($course, $courseData['modules']);

        return [
            'success' => true,
            'course' => $course,
            'activities' => $createdActivities,
            'badges' => $badges,
            'modules' => $courseData['modules']
        ];
    }

    public function validateContentSize(string $content): bool
    {
        return strlen($content) <= 51200; // 50KB limit
    }
}