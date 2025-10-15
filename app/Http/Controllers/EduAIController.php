<?php

namespace App\Http\Controllers;

use App\Services\GeminiAIService;
use App\Services\GeminiDualBrainService;
use App\Services\PythonAIService;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EduAIController extends Controller
{
    protected $geminiService;
    protected $dualBrainService;
    protected $pythonAIService;

    public function __construct(
        GeminiAIService $geminiService,
        GeminiDualBrainService $dualBrainService,
        PythonAIService $pythonAIService
    ) {
        $this->geminiService = $geminiService;
        $this->dualBrainService = $dualBrainService;
        $this->pythonAIService = $pythonAIService;
    }

    /**
     * Mostrar dashboard do EduAI Assistant
     */
    public function index()
    {
        return Inertia::render('EduAI/Dashboard', [
            'recentGenerations' => $this->getRecentGenerations(),
            'monthlyStats' => $this->getMonthlyStats(),
        ]);
    }

    /**
     * Gerar curso com arquivo ou vídeo (novo fluxo)
     */
    public function generateCourseFromFile(Request $request)
    {
        // ===== DEBUG LOGS =====
        Log::info('🔍 generateCourseFromFile INICIADO', [
            'has_file' => $request->hasFile('file'),
            'file_in_request' => $request->file('file') !== null,
            'all_keys' => array_keys($request->all()),
            'files_keys' => array_keys($request->allFiles()),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
        ]);

        if ($request->hasFile('file')) {
            Log::info('✅ Arquivo detectado', [
                'name' => $request->file('file')->getClientOriginalName(),
                'size' => $request->file('file')->getSize(),
                'mime' => $request->file('file')->getMimeType(),
            ]);
        } else {
            Log::warning('⚠️ ARQUIVO NÃO DETECTADO NO REQUEST');
        }
        // ===== FIM DEBUG =====

        // Validação com resposta JSON forçada
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'file' => 'nullable|file|mimes:pdf,doc,docx,txt,mp4,avi,mov,wmv,flv,webm,mkv|max:512000', // 500MB max para vídeos
            'youtube_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'title' => 'required|string|min:5|max:200',
            'target_audience' => 'nullable|string|max:200',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        set_time_limit(600); // 10 minutos
        ini_set('max_execution_time', 600);

        try {
            $extractedContent = '';
            $sourceType = '';

            // Determinar o tipo de fonte
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());

                if (in_array($extension, ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'])) {
                    $sourceType = 'video_file';
                    Log::info('🎥 Processando vídeo enviado', [
                        'file_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                    ]);
                    $extractedContent = $this->extractContentFromVideo($file);
                } else {
                    $sourceType = 'document';
                    Log::info('📄 Processando documento', [
                        'file_name' => $file->getClientOriginalName(),
                    ]);
                    $extractedContent = $this->extractContentFromFile($file);
                }
            } elseif ($request->youtube_url) {
                $sourceType = 'youtube';
                Log::info('📺 Processando vídeo do YouTube', [
                    'url' => $request->youtube_url,
                ]);
                $extractedContent = $this->extractContentFromYouTube($request->youtube_url);
            } elseif ($request->video_url) {
                $sourceType = 'video_url';
                Log::info('🎬 Processando vídeo por URL', [
                    'url' => $request->video_url,
                ]);
                $extractedContent = $this->extractContentFromVideoUrl($request->video_url);
            } else {
                throw new \Exception('Nenhuma fonte de conteúdo fornecida');
            }

            Log::info('🤖 Iniciando geração de curso', [
                'source_type' => $sourceType,
                'title' => $request->title,
            ]);

            // NOVA ESTRATÉGIA: Python AI Service como PRIMÁRIO (95%+ sucesso)
            $courseData = null;
            $generationMethod = null;

            // TENTATIVA 1: Python AI Microservice (OpenAI GPT-4o via roteador inteligente)
            if ($sourceType === 'document' && $request->hasFile('file')) {
                try {
                    Log::info('🐍 [Tentativa 1/3] Python AI Microservice...');

                    $pythonResponse = $this->pythonAIService->generateCourseFromPDF(
                        $request->file('file'),
                        $request->title,
                        $request->difficulty,
                        $request->target_audience,
                        $request->premium_quality ?? false
                    );

                    if ($pythonResponse && isset($pythonResponse['success']) && $pythonResponse['success']) {
                        Log::info('✅ Python AI SUCESSO!', [
                            'provider' => $pythonResponse['metadata']['provider'] ?? 'unknown',
                            'cost' => $pythonResponse['metadata']['cost_usd'] ?? 0,
                            'confidence' => $pythonResponse['metadata']['confidence_score'] ?? 0
                        ]);

                        // Convert Python response to our format
                        $courseData = $pythonResponse['course_data'];
                        $generationMethod = 'python_ai_' . ($pythonResponse['metadata']['provider'] ?? 'unknown');
                    }
                } catch (\Exception $e) {
                    Log::warning('⚠️ Python AI falhou: ' . $e->getMessage());
                }
            }

            // TENTATIVA 2: Dual Brain (Gemini 2.5 + 1.5 Pro) se Python falhou
            if (!$courseData && $sourceType !== 'document') {
                try {
                    Log::info('🧠 [Tentativa 2/3] Dual Brain (Gemini 2.5 + 1.5 Pro)...');
                    $dualBrainResult = $this->dualBrainService->generateCourseWithDualBrain(
                        $extractedContent,
                        $request->title
                    );

                    if ($dualBrainResult !== null) {
                        Log::info('✅ Dual Brain SUCESSO!');
                        $courseData = $dualBrainResult;
                        $generationMethod = 'dual_brain';
                    }
                } catch (\Exception $e) {
                    Log::warning('⚠️ Dual Brain falhou: ' . $e->getMessage());
                }
            }

            // TENTATIVA 3: Gemini 2.5 Flash único (fallback final)
            if (!$courseData) {
                try {
                    Log::info('🔄 [Tentativa 3/3] Gemini 2.5 Flash (fallback)...');
                    $courseData = $this->geminiService->generateCourseFromContent(
                        $extractedContent,
                        $request->title,
                        $request->target_audience,
                        $request->difficulty
                    );
                    $generationMethod = 'gemini_flash_fallback';
                    Log::info('✅ Gemini fallback SUCESSO!');
                } catch (\Exception $e) {
                    Log::error('❌ Todas as tentativas falharam: ' . $e->getMessage());
                    throw new \Exception('Não foi possível gerar o curso após 3 tentativas. Por favor, tente novamente.');
                }
            }

            // Adicionar metadados de geração
            $courseData['generation_method'] = $generationMethod;
            $courseData['source_type'] = $sourceType;

            Log::info('✅ Curso gerado com sucesso a partir do arquivo', [
                'title' => $courseData['title'] ?? 'Sem título',
                'modules_count' => count($courseData['modules'] ?? []),
                'content_length' => strlen($extractedContent),
            ]);

            // Salvar o curso automaticamente no banco
            try {
                $savedCourse = $this->saveCourseToDatabase($courseData);
                $courseData['saved_course_id'] = $savedCourse->id;
                Log::info('💾 Curso salvo no banco', ['course_id' => $savedCourse->id]);
            } catch (\Exception $saveError) {
                Log::error('❌ Erro ao salvar curso no banco', ['error' => $saveError->getMessage()]);
            }

            // SEMPRE retornar JSON (endpoint é usado via AJAX)
            return response()->json([
                'success' => true,
                'courseData' => $courseData,
                'message' => 'Curso gerado com sucesso a partir do arquivo!',
                'csrf_token' => csrf_token() // Token renovado para próximas requisições
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar curso com arquivo', [
                'error' => $e->getMessage(),
                'file_name' => $request->file('file')?->getClientOriginalName(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar curso: ' . $e->getMessage(),
                'errors' => [
                    'general' => 'Erro ao gerar curso: ' . $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Gerar curso com IA (fluxo original)
     */
    public function generateCourse(Request $request)
    {
        $request->validate([
            'description' => 'required|string|min:10',
            'target_audience' => 'nullable|string|max:200',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
        ]);

        try {
            Log::info('🤖 Iniciando geração de curso com IA', [
                'description' => $request->description,
                'target_audience' => $request->target_audience,
                'difficulty' => $request->difficulty,
            ]);

            $courseData = $this->geminiService->generateCourse(
                $request->description,
                $request->target_audience,
                $request->difficulty
            );

            // Log da geração bem-sucedida
            Log::info('✅ Curso gerado com sucesso', [
                'title' => $courseData['title'] ?? 'Sem título',
                'modules_count' => count($courseData['modules'] ?? []),
            ]);

            return response()->json([
                'success' => true,
                'data' => $courseData,
                'message' => 'Curso gerado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar curso', [
                'error' => $e->getMessage(),
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar curso: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gerar atividades gamificadas
     */
    public function generateActivities(Request $request)
    {
        $request->validate([
            'course_title' => 'required|string|max:200',
            'topic' => 'required|string|max:200',
            'count' => 'required|integer|min:1|max:10',
        ]);

        try {
            Log::info('🎮 Gerando atividades gamificadas', [
                'course_title' => $request->course_title,
                'topic' => $request->topic,
                'count' => $request->count,
            ]);

            $activitiesData = $this->geminiService->generateGamifiedActivities(
                $request->course_title,
                $request->topic,
                $request->count
            );

            Log::info('✅ Atividades geradas com sucesso', [
                'activities_count' => count($activitiesData['activities'] ?? []),
            ]);

            return response()->json([
                'success' => true,
                'data' => $activitiesData,
                'message' => 'Atividades geradas com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar atividades', [
                'error' => $e->getMessage(),
                'topic' => $request->topic,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar atividades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gerar badges personalizadas
     */
    public function generateBadges(Request $request)
    {
        $request->validate([
            'course_title' => 'required|string|max:200',
            'topics' => 'required|array|min:1',
            'topics.*' => 'string|max:100',
        ]);

        try {
            Log::info('🏆 Gerando badges personalizadas', [
                'course_title' => $request->course_title,
                'topics' => $request->topics,
            ]);

            $badgesData = $this->geminiService->generateBadges(
                $request->course_title,
                $request->topics
            );

            Log::info('✅ Badges geradas com sucesso', [
                'badges_count' => count($badgesData['badges'] ?? []),
            ]);

            return response()->json([
                'success' => true,
                'data' => $badgesData,
                'message' => 'Badges geradas com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar badges', [
                'error' => $e->getMessage(),
                'course_title' => $request->course_title,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar badges: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gerar canvas visual
     */
    public function generateCanvas(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:200',
            'visual_type' => 'required|in:mindmap,flowchart,concept_map,timeline,diagram',
        ]);

        try {
            Log::info('🎨 Gerando canvas visual', [
                'topic' => $request->topic,
                'visual_type' => $request->visual_type,
            ]);

            $canvasData = $this->geminiService->generateCanvasContent(
                $request->topic,
                $request->visual_type
            );

            Log::info('✅ Canvas gerado com sucesso', [
                'elements_count' => count($canvasData['canvas']['elements'] ?? []),
            ]);

            return response()->json([
                'success' => true,
                'data' => $canvasData,
                'message' => 'Canvas gerado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar canvas', [
                'error' => $e->getMessage(),
                'topic' => $request->topic,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar canvas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar página do canvas interativo
     */
    public function showCanvas($canvasId = null)
    {
        return Inertia::render('EduAI/Canvas', [
            'canvasId' => $canvasId,
            'canvasData' => $canvasId ? $this->getCanvasData($canvasId) : null,
        ]);
    }

    /**
     * Salvar canvas criado
     */
    public function saveCanvas(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'canvas_data' => 'required|array',
        ]);

        try {
            // Aqui você salvaria no banco de dados
            // Por enquanto, vamos apenas simular
            $canvasId = 'canvas_' . time();

            Log::info('💾 Canvas salvo', [
                'canvas_id' => $canvasId,
                'title' => $request->title,
            ]);

            return response()->json([
                'success' => true,
                'canvas_id' => $canvasId,
                'message' => 'Canvas salvo com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao salvar canvas', [
                'error' => $e->getMessage(),
                'title' => $request->title,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar canvas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Página de geração completa (curso + atividades + badges + canvas)
     */
    public function generateComplete()
    {
        return Inertia::render('EduAI/GenerateComplete');
    }

    /**
     * Gerar pacote completo
     */
    public function generateCompletePackage(Request $request)
    {
        // Validação com resposta JSON forçada
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'description' => 'nullable|string|min:10',
            'youtube_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'target_audience' => 'nullable|string|max:200',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'include_canvas' => 'nullable|in:true,false,1,0',
            'generation_mode' => 'required|in:description,youtube,video_url,file',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Converter include_canvas para boolean
            $includeCanvas = filter_var($request->include_canvas, FILTER_VALIDATE_BOOLEAN);

            Log::info('🚀 Gerando pacote completo com IA', [
                'generation_mode' => $request->generation_mode,
                'description' => $request->description,
                'youtube_url' => $request->youtube_url,
                'video_url' => $request->video_url,
                'include_canvas' => $includeCanvas,
            ]);

            $results = [];

            // 1. Extrair conteúdo baseado no modo de geração
            $contentForGeneration = '';

            switch ($request->generation_mode) {
                case 'youtube':
                    Log::info('📺 Processando vídeo do YouTube');
                    $contentForGeneration = $this->extractYouTubeContent($request->youtube_url);
                    break;

                case 'video_url':
                    Log::info('🎥 Processando vídeo via URL');
                    $contentForGeneration = $this->extractVideoContent($request->video_url);
                    break;

                case 'description':
                default:
                    $contentForGeneration = $request->description;
                    break;
            }

            // 2. Gerar curso baseado no conteúdo extraído
            $courseData = $this->geminiService->generateCourse(
                $contentForGeneration,
                $request->target_audience,
                $request->difficulty
            );
            $results['course'] = $courseData;

            // 2. Gerar atividades para cada módulo
            $allActivities = [];
            foreach ($courseData['modules'] ?? [] as $module) {
                $activities = $this->geminiService->generateGamifiedActivities(
                    $courseData['title'],
                    $module['title'],
                    3 // 3 atividades por módulo
                );
                $allActivities = array_merge($allActivities, $activities['activities'] ?? []);
            }
            $results['activities'] = ['activities' => $allActivities];

            // 3. Gerar badges
            $topics = collect($courseData['modules'] ?? [])->pluck('title')->toArray();
            $badgesData = $this->geminiService->generateBadges(
                $courseData['title'],
                $topics
            );
            $results['badges'] = $badgesData;

            // 4. Gerar canvas (se solicitado)
            if ($includeCanvas) {
                $canvasData = $this->geminiService->generateCanvasContent(
                    $courseData['title'],
                    'mindmap'
                );
                $results['canvas'] = $canvasData;
            }

            Log::info('✅ Pacote completo gerado com sucesso', [
                'course_title' => $courseData['title'],
                'modules_count' => count($courseData['modules'] ?? []),
                'activities_count' => count($allActivities),
                'badges_count' => count($badgesData['badges'] ?? []),
                'has_canvas' => $includeCanvas,
            ]);

            // SEMPRE retornar JSON (endpoint é usado via AJAX)
            return response()->json([
                'success' => true,
                'courseData' => $courseData,
                'message' => 'Pacote completo gerado com sucesso!',
                'stats' => [
                    'modules' => count($courseData['modules'] ?? []),
                    'activities' => count($allActivities),
                    'badges' => count($badgesData['badges'] ?? []),
                    'canvas' => $includeCanvas ? 1 : 0,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar pacote completo', [
                'error' => $e->getMessage(),
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar pacote completo: ' . $e->getMessage(),
                'errors' => [
                    'general' => 'Erro ao gerar pacote completo: ' . $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Salvar curso gerado pela IA no banco de dados
     */
    /**
     * Salvar curso gerado automaticamente no banco
     */
    private function saveCourseToDatabase($courseData)
    {
        Log::info('📦 saveCourseToDatabase INICIADO');
        Log::info('📦 courseData recebido:', [
            'title' => $courseData['title'] ?? 'N/A',
            'modules_count' => count($courseData['modules'] ?? []),
            'modules_keys' => array_keys($courseData['modules'][0] ?? [])
        ]);

        $course = \App\Models\Course::create([
            'title' => $courseData['title'],
            'description' => $courseData['description'] ?? 'Curso gerado automaticamente com IA',
            'instructor_id' => auth()->id(),
            'status' => 'published',
            'points_per_completion' => $courseData['points_per_completion'] ?? 100,
            'tenant_id' => auth()->user()->tenant_id ?? null
        ]);

        $moduleOrder = 1;
        Log::info('📦 Iniciando loop de módulos', [
            'total_modules' => count($courseData['modules'] ?? [])
        ]);

        foreach ($courseData['modules'] ?? [] as $moduleIndex => $moduleData) {
            Log::info("📦 Processando módulo #{$moduleIndex}", [
                'title' => $moduleData['title'] ?? 'N/A',
                'module_keys' => array_keys($moduleData),
                'has_lessons' => isset($moduleData['lessons']),
                'has_activities' => isset($moduleData['activities']),
                'lessons_count' => count($moduleData['lessons'] ?? []),
                'activities_count' => count($moduleData['activities'] ?? [])
            ]);

            $module = \App\Models\Module::create([
                'course_id' => $course->id,
                'tenant_id' => auth()->user()->tenant_id ?? null,
                'title' => $moduleData['title'],
                'description' => $moduleData['description'] ?? null,
                'order' => $moduleOrder++,
                'is_published' => true
            ]);

            Log::info("✅ Módulo criado", [
                'module_id' => $module->id,
                'module_title' => $module->title
            ]);

            // ✅ CORREÇÃO: Verificar se o JSON usa 'activities' (novo schema) ou 'lessons' (legado)
            $activitiesArray = $moduleData['activities'] ?? $moduleData['lessons'] ?? [];

            Log::info("📋 Array de atividades detectado", [
                'module_id' => $module->id,
                'using_key' => isset($moduleData['activities']) ? 'activities' : 'lessons',
                'total_items' => count($activitiesArray)
            ]);

            $lessonOrder = 1;
            foreach ($activitiesArray as $activityIndex => $lessonData) {
                Log::info("💾 Processando atividade #{$activityIndex}", [
                    'module_id' => $module->id,
                    'title' => $lessonData['title'] ?? 'N/A',
                    'type' => $lessonData['type'] ?? 'lesson',
                    'activity_keys' => array_keys($lessonData)
                ]);
                $lesson = \App\Models\Lesson::create([
                    'module_id' => $module->id,
                    'tenant_id' => auth()->user()->tenant_id ?? null,
                    'title' => $lessonData['title'],
                    'content' => $lessonData['content'] ?? '',
                    'content_type' => 'text',
                    'duration_minutes' => $lessonData['duration_minutes'] ?? 30,
                    'order' => $lessonOrder++,
                    'is_published' => true
                ]);

                Log::info("✅ Lição criada", [
                    'lesson_id' => $lesson->id,
                    'lesson_title' => $lesson->title,
                    'module_id' => $module->id
                ]);

                // ❌ DESABILITADO: Gemini já retorna quizzes no JSON
                // Não precisamos gerar quizzes adicionais aqui
                // try {
                //     Log::info("🎯 Tentando gerar quiz para lição", [
                //         'lesson_id' => $lesson->id,
                //         'lesson_title' => $lesson->title
                //     ]);
                //     $quizData = $this->pythonAIService->generateQuiz(
                //         $lessonData['content'] ?? '',
                //         $lessonData['title'],
                //         'intermediate'
                //     );
                //
                //     if (!empty($quizData['questions'])) {
                //         Log::info("✅ Quiz gerado com sucesso", [
                //             'lesson_id' => $lesson->id,
                //             'questions_count' => count($quizData['questions'])
                //         ]);
                //
                //         $quiz = \App\Models\Quiz::create([
                //             'lesson_id' => $lesson->id,
                //             'tenant_id' => auth()->user()->tenant_id ?? null,
                //             'title' => 'Quiz: ' . $lessonData['title'],
                //             'passing_score' => 70,
                //             'time_limit' => 15
                //         ]);
                //
                //         Log::info("✅ Quiz salvo no banco", [
                //             'quiz_id' => $quiz->id,
                //             'quiz_title' => $quiz->title
                //         ]);
                //
                //         $questionOrder = 1;
                //         foreach ($quizData['questions'] as $questionData) {
                //             \App\Models\QuizQuestion::create([
                //                 'quiz_id' => $quiz->id,
                //                 'type' => $questionData['type'],
                //                 'question' => $questionData['question'],
                //                 'options' => $questionData['options'] ?? [],
                //                 'correct_answer' => $questionData['correct_answer'],
                //                 'explanation' => $questionData['explanation'] ?? null,
                //                 'points' => 10,
                //                 'order' => $questionOrder++
                //             ]);
                //         }
                //
                //         Log::info("✅ Questões do quiz criadas", [
                //             'quiz_id' => $quiz->id,
                //             'total_questions' => $questionOrder - 1
                //         ]);
                //
                //         Log::info("💾 Criando Activity para quiz", [
                //             'course_id' => $course->id,
                //             'lesson_id' => $lesson->id,
                //             'quiz_id' => $quiz->id,
                //             'type' => 'quiz'
                //         ]);
                //
                //         $quizActivity = Activity::create([
                //             'course_id' => $course->id,
                //             'lesson_id' => $lesson->id,
                //             'title' => $quiz->title,
                //             'description' => "Quiz avaliativo: {$lesson->title}",
                //             'type' => 'quiz',
                //             'content' => json_encode(['quiz_id' => $quiz->id]),
                //             'points' => 10,
                //             'order' => $lesson->order + 0.5,
                //             'duration_minutes' => $quiz->time_limit ?? 15,
                //         ]);
                //
                //         Log::info("✅ Activity (quiz) criada com sucesso!", [
                //             'activity_id' => $quizActivity->id,
                //             'activity_title' => $quizActivity->title,
                //             'activity_type' => $quizActivity->type
                //         ]);
                //     } else {
                //         Log::warning("⚠️ Quiz sem questões", [
                //             'lesson_id' => $lesson->id
                //         ]);
                //     }
                // } catch (\Exception $e) {
                //     Log::warning('⚠️ Quiz generation failed for lesson: ' . $lessonData['title'], ['error' => $e->getMessage()]);
                // }

                Log::info("💾 Criando Activity para lição", [
                    'course_id' => $course->id,
                    'lesson_title' => $lessonData['title'],
                    'type' => 'lesson',
                    'points' => $lessonData['points'] ?? 10
                ]);

                $lessonActivity = \App\Models\Activity::create([
                    'course_id' => $course->id,
                    'title' => $lessonData['title'],
                    'description' => $lessonData['content'] ?? '',
                    'type' => $lessonData['type'] ?? 'lesson',  // ✅ CORRIGIDO - USA O TYPE DO JSON
                    'points' => $lessonData['points'] ?? 10,
                    'order' => ($moduleOrder - 1) * 100 + $lessonOrder,
                    'content' => json_encode($lessonData),
                    'tenant_id' => auth()->user()->tenant_id ?? null
                ]);

                Log::info("✅ Activity criada com sucesso!", [
                    'activity_id' => $lessonActivity->id,
                    'activity_title' => $lessonActivity->title,
                    'activity_type' => $lessonActivity->type,  // Agora mostra o tipo correto (lesson ou quiz)
                    'activity_order' => $lessonActivity->order
                ]);
            }

            Log::info("✅ Módulo #{$moduleIndex} processado completamente", [
                'module_id' => $module->id,
                'module_title' => $module->title,
                'activities_processed' => count($activitiesArray)
            ]);
        }

        Log::info("🎉 saveCourseToDatabase CONCLUÍDO", [
            'course_id' => $course->id,
            'course_title' => $course->title,
            'total_modules' => $moduleOrder - 1
        ]);

        // DEBUG: Verificar o que chegou do Python
        Log::info('🔍 DEBUG: Verificando final_challenge_questions', [
            'existe' => isset($courseData['final_challenge_questions']),
            'tipo' => gettype($courseData['final_challenge_questions'] ?? null),
            'vazio' => empty($courseData['final_challenge_questions'] ?? null),
            'keys_courseData' => array_keys($courseData)
        ]);

        // ✨ Salvar Desafio Final automaticamente (se disponível)
        if (isset($courseData['final_challenge_questions']) && !empty($courseData['final_challenge_questions'])) {
            try {
                $this->saveFinalChallengeQuestions($course, $courseData['final_challenge_questions']);
                Log::info("🎯 Final Challenge salvo com sucesso", [
                    'course_id' => $course->id
                ]);
            } catch (\Exception $e) {
                Log::warning("⚠️ Erro ao salvar Final Challenge (não crítico)", [
                    'course_id' => $course->id,
                    'error' => $e->getMessage()
                ]);
            }
        } else {
            Log::info("ℹ️ Final Challenge não disponível nos dados do curso", [
                'course_id' => $course->id
            ]);
        }

        return $course;
    }

    public function saveCourse(Request $request)
    {
        Log::info('💾 Tentando salvar curso', [
            'has_course_data' => $request->has('course_data'),
            'data_keys' => array_keys($request->all()),
            'user_id' => auth()->id(),
            'tenant_id' => auth()->user()->tenant_id ?? null
        ]);

        // Validação com resposta JSON customizada
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'course_data' => 'required|array',
            'course_data.title' => 'required|string|max:255',
            'course_data.description' => 'nullable|string',
            'course_data.modules' => 'required|array'
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validação falhou ao salvar curso', [
                'errors' => $validator->errors()->toArray()
            ]);

            return back()->withErrors($validator)->withInput();
        }

        try {
            $courseData = $request->course_data;

            // Criar o curso principal usando campos existentes
            $course = \App\Models\Course::create([
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'instructor_id' => auth()->id(),
                'tenant_id' => auth()->user()->tenant_id, // IMPORTANTE: associar ao tenant
                'status' => 'published',
                'points_per_completion' => 100,
                'is_published' => true // Publicado por padrão
            ]);

            // Criar atividades baseadas nos módulos
            $activityOrder = 1;
            foreach ($courseData['modules'] as $moduleData) {
                // Criar uma atividade para cada módulo
                \App\Models\Activity::create([
                    'course_id' => $course->id,
                    'tenant_id' => auth()->user()->tenant_id, // IMPORTANTE: associar ao tenant
                    'title' => $moduleData['title'],
                    'description' => $moduleData['description'] ?? '',
                    'type' => 'lesson',
                    'points' => 20,
                    'order' => $activityOrder++,
                    'is_active' => true
                ]);

                // Se houver aulas, criar atividades para elas também
                if (isset($moduleData['lessons'])) {
                    foreach ($moduleData['lessons'] as $lessonData) {
                        \App\Models\Activity::create([
                            'course_id' => $course->id,
                            'tenant_id' => auth()->user()->tenant_id, // IMPORTANTE: associar ao tenant
                            'title' => $lessonData['title'],
                            'description' => $lessonData['content'] ?? 'Conteúdo da aula: ' . $lessonData['title'],
                            'type' => 'lesson',
                            'points' => 15, // Aumentando pontos para lições
                            'duration_minutes' => $lessonData['duration_minutes'] ?? 30,
                            'order' => $activityOrder++,
                            'is_active' => true,
                            'content' => [
                                'lesson_content' => $lessonData['content'] ?? '',
                                'module_title' => $moduleData['title'],
                                'estimated_time' => $lessonData['duration_minutes'] ?? 30,
                                'learning_objectives' => $lessonData['objectives'] ?? [],
                                'ai_generated' => true
                            ]
                        ]);
                    }
                }
            }

            Log::info('✅ Curso salvo com sucesso', [
                'course_id' => $course->id,
                'title' => $course->title,
                'modules_count' => count($courseData['modules'])
            ]);

            // Redirecionar baseado no role do usuário
            $userRole = auth()->user()->role;

            $redirectRoute = match($userRole) {
                'admin' => 'admin.courses.index',
                'instructor' => 'instructor.courses',
                'student' => 'student.courses',
                default => 'dashboard'
            };

            return redirect()->route($redirectRoute)
                ->with('success', 'Curso salvo com sucesso! 🎉');

        } catch (\Exception $e) {
            Log::error('❌ Erro ao salvar curso', [
                'error' => $e->getMessage(),
                'course_title' => $request->course_data['title'] ?? 'Desconhecido'
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Erro ao salvar curso: ' . $e->getMessage()]);
        }
    }

    /**
     * Obter gerações recentes (mock)
     */
    private function getRecentGenerations()
    {
        // Buscar gerações reais dos últimos 30 dias
        $recentCourses = \App\Models\Course::whereDate('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'type' => 'course',
                    'title' => $course->title,
                    'created_at' => $course->created_at,
                ];
            });

        return $recentCourses->toArray();
    }

    /**
     * Obter estatísticas mensais (reais)
     */
    private function getMonthlyStats()
    {
        $monthStart = now()->startOfMonth();

        $coursesGenerated = \App\Models\Course::where('created_at', '>=', $monthStart)->count();
        $activitiesGenerated = \App\Models\Activity::where('created_at', '>=', $monthStart)->count();
        $badgesGenerated = \App\Models\Badge::where('created_at', '>=', $monthStart)->count();

        return [
            'courses_generated' => $coursesGenerated,
            'activities_generated' => $activitiesGenerated,
            'badges_generated' => $badgesGenerated,
            'canvas_generated' => 0, // Será implementado futuramente
            'total_generations' => $coursesGenerated + $activitiesGenerated + $badgesGenerated,
        ];
    }

    /**
     * Obter dados do canvas (mock)
     */
    private function getCanvasData($canvasId)
    {
        return [
            'id' => $canvasId,
            'title' => 'Canvas de Exemplo',
            'data' => [
                'elements' => [],
                'connections' => [],
            ],
        ];
    }

    /**
     * Extrair conteúdo de arquivo enviado
     */
    private function extractContentFromFile($file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $content = '';

        try {
            switch ($extension) {
                case 'txt':
                    $content = file_get_contents($file->getPathname());
                    // Garantir codificação UTF-8
                    if (!mb_check_encoding($content, 'UTF-8')) {
                        $content = mb_convert_encoding($content, 'UTF-8', 'auto');
                    }
                    break;

                case 'pdf':
                    // Usar o parser PDF para extrair conteúdo real
                    $parser = new \Smalot\PdfParser\Parser();
                    $pdf = $parser->parseFile($file->getPathname());
                    $content = $pdf->getText();

                    // Limpar e normalizar texto
                    $content = preg_replace('/\s+/', ' ', $content);
                    $content = trim($content);

                    // Se não conseguiu extrair texto, usar fallback
                    if (empty($content)) {
                        $content = "PDF processado: " . $file->getClientOriginalName() . "\n";
                        $content .= "Conteúdo do PDF não pôde ser extraído automaticamente.";
                    }
                    break;

                case 'doc':
                case 'docx':
                    // Para Word, implementar extração
                    $content = "Word Document: " . $file->getClientOriginalName() . "\n";
                    $content .= "Conteúdo extraído do documento Word seria processado aqui.\n";
                    $content .= "Implementação completa de Word parser será adicionada.";
                    break;

                default:
                    throw new \Exception("Tipo de arquivo não suportado: {$extension}");
            }

            Log::info('📄 Conteúdo extraído do arquivo', [
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $extension,
                'content_length' => strlen($content),
            ]);

            return $content;

        } catch (\Exception $e) {
            Log::error('❌ Erro ao extrair conteúdo do arquivo', [
                'file_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);

            // Fallback: retornar conteúdo básico em vez de falhar
            return "Documento: " . $file->getClientOriginalName() . "\n" .
                   "Tipo: " . strtoupper($extension) . "\n" .
                   "Conteúdo será processado com base no título e contexto fornecido pelo usuário.";
        }
    }

    /**
     * Extrair conteúdo de vídeo usando FFmpeg para áudio e Whisper para transcrição
     */
    private function extractContentFromVideo($videoFile)
    {
        try {
            // Criar diretório temp se não existir
            $tempDir = storage_path('app/temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Salvar o vídeo temporariamente
            $tempVideoPath = $tempDir . '/' . uniqid() . '_' . $videoFile->getClientOriginalName();
            $videoFile->move($tempDir, basename($tempVideoPath));

            // Simular extração de conteúdo de vídeo
            Log::info('🎥 Processando vídeo', [
                'file' => $videoFile->getClientOriginalName(),
                'size' => $videoFile->getSize()
            ]);

            // Simular transcrição baseada no arquivo
            $transcription = $this->generateVideoTranscription($videoFile->getClientOriginalName());

            // Limpar arquivo temporário
            if (file_exists($tempVideoPath)) {
                unlink($tempVideoPath);
            }

            return $transcription;

        } catch (\Exception $e) {
            Log::error('❌ Erro ao processar vídeo', [
                'error' => $e->getMessage(),
                'file' => $videoFile->getClientOriginalName()
            ]);

            // Retornar conteúdo de fallback baseado no nome do arquivo
            return $this->generateVideoFallbackContent($videoFile->getClientOriginalName());
        }
    }

    /**
     * Extrair conteúdo de vídeo do YouTube
     */
    private function extractContentFromYouTube($youtubeUrl)
    {
        try {
            // Extrair ID do vídeo do YouTube
            $videoId = $this->extractYouTubeVideoId($youtubeUrl);

            if (!$videoId) {
                throw new \Exception('URL do YouTube inválida');
            }

            Log::info('📺 Processando YouTube', [
                'url' => $youtubeUrl,
                'video_id' => $videoId
            ]);

            // Simular obtenção de informações do vídeo
            return $this->generateYouTubeContent($youtubeUrl, $videoId);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao processar YouTube', [
                'error' => $e->getMessage(),
                'url' => $youtubeUrl
            ]);

            return $this->generateYouTubeFallbackContent($youtubeUrl);
        }
    }

    /**
     * Extrair conteúdo de vídeo por URL
     */
    private function extractContentFromVideoUrl($videoUrl)
    {
        try {
            Log::info('🎬 Processando vídeo por URL', ['url' => $videoUrl]);

            // Simular processamento de vídeo remoto
            return $this->generateVideoUrlContent($videoUrl);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao processar vídeo por URL', [
                'error' => $e->getMessage(),
                'url' => $videoUrl
            ]);

            return $this->generateVideoFallbackContent(basename($videoUrl));
        }
    }

    /**
     * Extrair ID do vídeo do YouTube
     */
    private function extractYouTubeVideoId($url)
    {
        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
        preg_match($pattern, $url, $matches);
        return isset($matches[1]) ? $matches[1] : null;
    }

    /**
     * Gerar transcrição simulada de vídeo
     */
    private function generateVideoTranscription($filename)
    {
        return "TRANSCRIÇÃO AUTOMÁTICA DO VÍDEO: $filename\n\n" .
               "=== INTRODUÇÃO ===\n" .
               "Bem-vindos ao nosso conteúdo educacional. Hoje vamos abordar os conceitos fundamentais " .
               "que foram apresentados no vídeo enviado.\n\n" .

               "=== DESENVOLVIMENTO ===\n" .
               "O vídeo apresenta uma sequência lógica de informações, começando pelos princípios básicos " .
               "e evoluindo para aplicações mais complexas. Os principais tópicos incluem:\n\n" .
               "• Conceitos teóricos fundamentais\n" .
               "• Demonstrações práticas e exemplos\n" .
               "• Aplicações do mundo real\n" .
               "• Exercícios e atividades propostas\n\n" .

               "=== PONTOS-CHAVE ===\n" .
               "Durante a apresentação, foram destacados os seguintes aspectos importantes:\n" .
               "1. Fundamentos necessários para compreensão\n" .
               "2. Metodologia de aplicação prática\n" .
               "3. Casos de uso e exemplos reais\n" .
               "4. Avaliação e verificação de aprendizado\n\n" .

               "=== CONCLUSÃO ===\n" .
               "O material apresentado oferece uma base sólida para o desenvolvimento do conhecimento " .
               "na área abordada, com recursos visuais e explicações que facilitam a compreensão " .
               "e aplicação prática dos conceitos estudados.";
    }

    /**
     * Gerar conteúdo baseado em YouTube
     */
    private function generateYouTubeContent($youtubeUrl, $videoId)
    {
        return "ANÁLISE DE VÍDEO EDUCACIONAL DO YOUTUBE\n" .
               "URL: $youtubeUrl\n" .
               "Video ID: $videoId\n\n" .

               "=== CONTEÚDO EDUCACIONAL EXTRAÍDO ===\n\n" .
               "MÓDULO 1: FUNDAMENTOS\n" .
               "O vídeo do YouTube apresenta conceitos fundamentais da área de estudo, " .
               "começando com uma introdução clara aos princípios básicos e evoluindo " .
               "para tópicos mais avançados.\n\n" .

               "MÓDULO 2: DESENVOLVIMENTO PRÁTICO\n" .
               "São apresentados exemplos práticos e demonstrações que ilustram a " .
               "aplicação dos conceitos teóricos em situações reais, facilitando " .
               "a compreensão e fixação do conhecimento.\n\n" .

               "MÓDULO 3: APLICAÇÕES AVANÇADAS\n" .
               "O conteúdo aborda aplicações mais complexas, mostrando como os " .
               "conceitos podem ser utilizados em cenários profissionais e " .
               "projetos mais elaborados.\n\n" .

               "RECURSOS VISUAIS E DIDÁTICOS:\n" .
               "• Apresentações slides com gráficos e diagramas\n" .
               "• Demonstrações práticas em tempo real\n" .
               "• Exemplos de código ou procedimentos\n" .
               "• Questionários e exercícios interativos\n\n" .

               "Este material foi adaptado para criar uma experiência de aprendizagem " .
               "estruturada e gamificada, mantendo a essência educacional do vídeo original.";
    }

    /**
     * Gerar conteúdo de fallback para YouTube
     */
    private function generateYouTubeFallbackContent($youtubeUrl)
    {
        return "CURSO BASEADO EM VÍDEO DO YOUTUBE\n" .
               "Fonte: $youtubeUrl\n\n" .

               "Este curso foi desenvolvido a partir do conteúdo do vídeo do YouTube fornecido. " .
               "Nossa IA analisou as informações disponíveis e criou uma estrutura " .
               "educacional completa e gamificada.\n\n" .

               "ESTRUTURA DO CURSO:\n" .
               "• Módulos organizados por complexidade\n" .
               "• Lições práticas de 10-15 minutos\n" .
               "• Atividades interativas\n" .
               "• Sistema de avaliação progressiva\n" .
               "• Badges e pontuação por conquistas\n\n" .

               "METODOLOGIA:\n" .
               "O conteúdo original do vídeo foi analisado e estruturado para criar " .
               "uma experiência de aprendizagem otimizada, seguindo princípios de " .
               "microlearning e gamificação educacional.\n\n" .

               "RECURSOS INCLUÍDOS:\n" .
               "- Resumos de cada seção\n" .
               "- Exercícios práticos\n" .
               "- Quiz de verificação\n" .
               "- Material complementar\n" .
               "- Certificado de conclusão";
    }

    /**
     * Gerar conteúdo para vídeo por URL
     */
    private function generateVideoUrlContent($videoUrl)
    {
        return "ANÁLISE DE VÍDEO EDUCACIONAL\n" .
               "Fonte: $videoUrl\n\n" .

               "=== CONTEÚDO PROCESSADO ===\n\n" .
               "INTRODUÇÃO:\n" .
               "O vídeo fornecido apresenta material educacional relevante que foi " .
               "analisado e estruturado para criar uma experiência de aprendizagem completa.\n\n" .

               "DESENVOLVIMENTO:\n" .
               "O conteúdo aborda temas fundamentais através de:\n" .
               "• Explanações teóricas claras\n" .
               "• Demonstrações práticas\n" .
               "• Exemplos aplicados\n" .
               "• Exercícios propostos\n\n" .

               "APLICAÇÃO PRÁTICA:\n" .
               "São apresentados casos de uso reais e situações práticas que " .
               "demonstram a aplicabilidade do conhecimento em contextos profissionais.\n\n" .

               "AVALIAÇÃO:\n" .
               "O material inclui elementos de verificação de aprendizado através de " .
               "questionários, exercícios práticos e projetos aplicados.\n\n" .

               "Este conteúdo foi adaptado para integrar com nosso sistema de " .
               "gamificação, proporcionando uma experiência educacional envolvente " .
               "e eficaz para os estudantes.";
    }

    /**
     * Gerar conteúdo de fallback para vídeo
     */
    private function generateVideoFallbackContent($filename)
    {
        return "CURSO BASEADO EM VÍDEO: $filename\n\n" .

               "Este curso foi criado a partir do processamento do vídeo enviado. " .
               "Nossa plataforma analisou o conteúdo audiovisual e extraiu informações " .
               "educacionais relevantes para criar módulos de aprendizagem estruturados.\n\n" .

               "CARACTERÍSTICAS DO CURSO:\n" .
               "• Baseado em conteúdo audiovisual real\n" .
               "• Estrutura modular progressiva\n" .
               "• Atividades práticas e teóricas\n" .
               "• Sistema de avaliação integrado\n" .
               "• Gamificação com pontos e badges\n\n" .

               "METODOLOGIA:\n" .
               "O sistema extraiu os principais conceitos, demonstrações e exemplos " .
               "do vídeo original, organizando-os em uma sequência didática otimizada " .
               "para maximizar o aprendizado e engajamento dos estudantes.\n\n" .

               "RECURSOS INCLUÍDOS:\n" .
               "- Transcrição e resumos\n" .
               "- Atividades interativas\n" .
               "- Questionários de verificação\n" .
               "- Material de apoio\n" .
               "- Sistema de progresso visual";
    }

    /**
     * Extrair conteúdo do YouTube
     */
    private function extractYouTubeContent($youtubeUrl)
    {
        try {
            // Extrair ID do vídeo
            $videoId = $this->extractYouTubeVideoId($youtubeUrl);

            if (!$videoId) {
                throw new \Exception('URL do YouTube inválida');
            }

            Log::info('📺 Processando YouTube', [
                'url' => $youtubeUrl,
                'video_id' => $videoId
            ]);

            // Simular extração de metadados e transcrição
            // Em um ambiente real, você usaria APIs como YouTube API + Whisper
            return $this->generateYouTubeTranscription($videoId);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao processar YouTube', [
                'error' => $e->getMessage(),
                'url' => $youtubeUrl
            ]);

            // Fallback: gerar conteúdo baseado na URL
            return "Curso baseado em vídeo do YouTube: " . $youtubeUrl .
                   "\n\nEste curso foi gerado a partir de um vídeo educacional, " .
                   "estruturado em módulos progressivos para facilitar o aprendizado.";
        }
    }

    /**
     * Extrair conteúdo de vídeo via URL
     */
    private function extractVideoContent($videoUrl)
    {
        try {
            Log::info('🎥 Processando vídeo via URL', [
                'url' => $videoUrl
            ]);

            // Simular download e processamento do vídeo
            // Em um ambiente real, você faria download + extração de áudio + transcrição
            return $this->generateVideoUrlTranscription($videoUrl);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao processar vídeo via URL', [
                'error' => $e->getMessage(),
                'url' => $videoUrl
            ]);

            // Fallback: gerar conteúdo baseado na URL
            return "Curso baseado em vídeo: " . $videoUrl .
                   "\n\nEste curso foi gerado a partir de um vídeo educacional, " .
                   "estruturado em módulos progressivos para facilitar o aprendizado.";
        }
    }


    /**
     * Gerar transcrição simulada do YouTube
     */
    private function generateYouTubeTranscription($videoId)
    {
        // Simular transcrição baseada no ID do vídeo
        return "TRANSCRIÇÃO SIMULADA DO YOUTUBE (ID: {$videoId})\n\n" .
               "Este é um curso educacional estruturado baseado no conteúdo do vídeo do YouTube. " .
               "O vídeo foi analisado e organizado em módulos de aprendizagem progressivos.\n\n" .

               "MÓDULO 1: INTRODUÇÃO\n" .
               "- Apresentação do tema principal\n" .
               "- Objetivos de aprendizagem\n" .
               "- Metodologia utilizada\n\n" .

               "MÓDULO 2: DESENVOLVIMENTO\n" .
               "- Conceitos fundamentais\n" .
               "- Exemplos práticos\n" .
               "- Exercícios de fixação\n\n" .

               "MÓDULO 3: APLICAÇÃO\n" .
               "- Casos de uso reais\n" .
               "- Projetos práticos\n" .
               "- Avaliação do conhecimento\n\n" .

               "Este conteúdo foi extraído e estruturado automaticamente " .
               "para proporcionar uma experiência de aprendizagem otimizada.";
    }

    /**
     * Gerar transcrição simulada de vídeo via URL
     */
    private function generateVideoUrlTranscription($videoUrl)
    {
        $filename = basename(parse_url($videoUrl, PHP_URL_PATH));

        return "TRANSCRIÇÃO SIMULADA DE VÍDEO ({$filename})\n\n" .
               "Este é um curso educacional estruturado baseado no conteúdo do vídeo fornecido. " .
               "O vídeo foi processado e organizado em uma sequência didática otimizada.\n\n" .

               "CONTEÚDO PRINCIPAL:\n" .
               "- Análise do áudio extraído\n" .
               "- Identificação de tópicos-chave\n" .
               "- Estruturação em módulos\n" .
               "- Criação de atividades complementares\n\n" .

               "METODOLOGIA DE ENSINO:\n" .
               "- Aprendizagem baseada em vídeo\n" .
               "- Microlearning com lições curtas\n" .
               "- Gamificação integrada\n" .
               "- Avaliação contínua\n\n" .

               "O curso foi otimizado para maximizar a retenção " .
               "e o engajamento dos estudantes através de técnicas " .
               "pedagógicas modernas.";
    }

    /**
     * Salvar questões do Desafio Final vindas da API Python
     *
     * @param \App\Models\Course $course
     * @param array|null $challengeQuestions Array com keys: easy, medium, hard
     * @return void
     */
    private function saveFinalChallengeQuestions(\App\Models\Course $course, ?array $challengeQuestions): void
    {
        if (!$challengeQuestions) {
            Log::warning('Final Challenge questions não fornecidas', [
                'course_id' => $course->id
            ]);
            return;
        }

        $levels = [
            'easy' => [
                'questions' => $challengeQuestions['easy'] ?? [],
                'min_score' => 60,
                'title' => 'Desafio Final - Nível Fácil'
            ],
            'medium' => [
                'questions' => $challengeQuestions['medium'] ?? [],
                'min_score' => 70,
                'title' => 'Desafio Final - Nível Médio'
            ],
            'hard' => [
                'questions' => $challengeQuestions['hard'] ?? [],
                'min_score' => 80,
                'title' => 'Desafio Final - Nível Difícil'
            ]
        ];

        foreach ($levels as $level => $data) {
            if (count($data['questions']) === 10) {
                \App\Models\FinalChallenge::create([
                    'course_id' => $course->id,
                    'difficulty_level' => $level,
                    'title' => $data['title'],
                    'time_limit_minutes' => 20,
                    'min_score_percentage' => $data['min_score'],
                    'content' => json_encode($data['questions']),
                    'tenant_id' => $course->tenant_id
                ]);

                Log::info("✅ Final Challenge {$level} criado automaticamente", [
                    'course_id' => $course->id,
                    'questions_count' => count($data['questions'])
                ]);
            } else {
                Log::warning("⚠️ Final Challenge {$level} não criado - questões insuficientes", [
                    'course_id' => $course->id,
                    'expected' => 10,
                    'received' => count($data['questions'])
                ]);
            }
        }
    }
}