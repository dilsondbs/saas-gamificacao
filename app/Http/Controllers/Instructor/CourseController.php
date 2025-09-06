<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Services\AICourseGeneratorService;
use App\Services\MaterialContentExtractor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function createWithAI()
    {
        return Inertia::render('Instructor/CreateCourseWithAI');
    }

    public function generateFromContent(Request $request)
    {
        try {
            $request->validate([
                'content' => 'required|string|max:51200', // 50KB limit
                'content_type' => 'required|in:text,file'
            ]);

            $content = $request->input('content');
            $contentType = $request->input('content_type');

            // Extract content from uploaded file if needed
            if ($contentType === 'file') {
                $request->validate([
                    'file' => 'required|file|mimes:txt,pdf|max:2048' // 2MB limit for files
                ]);

                $file = $request->file('file');
                $extractor = new MaterialContentExtractor();
                
                // Create temporary file-like object for extraction
                $tempContent = $extractor->extractFromUploadedFile($file);
                $content = $tempContent['clean_text'] ?? $content;
            }

            $aiService = new AICourseGeneratorService();
            $result = $aiService->generateCourseFromContent($content, Auth::id());

            if ($result['success']) {
                Log::info('AI Course generated successfully', [
                    'instructor_id' => Auth::id(),
                    'course_id' => $result['course']->id,
                    'activities_count' => count($result['activities']),
                    'badges_count' => count($result['badges'])
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Curso gerado com sucesso pela IA!',
                    'course' => $result['course'],
                    'preview' => [
                        'modules' => $result['modules'],
                        'activities_count' => count($result['activities']),
                        'badges_count' => count($result['badges']),
                        'total_points' => $result['course']->points_per_completion
                    ]
                ]);
            } else {
                throw new \Exception($result['error'] ?? 'Failed to generate course');
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('AI Course generation failed', [
                'instructor_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar curso: ' . $e->getMessage()
            ], 500);
        }
    }

    public function previewGenerated(Request $request)
    {
        try {
            $request->validate([
                'content' => 'required|string|max:51200',
                'preview_only' => 'boolean'
            ]);

            $content = $request->input('content');
            $aiService = new AICourseGeneratorService();

            // Simulate course generation without saving to database
            $prompt = $aiService->buildCourseGenerationPrompt($content);
            $response = $aiService->callGeminiAPI($prompt);
            $courseData = $aiService->parseCourseResponse($response);

            return response()->json([
                'success' => true,
                'preview' => [
                    'title' => $courseData['title'],
                    'description' => $courseData['description'],
                    'points_per_completion' => $courseData['points_per_completion'],
                    'modules' => $courseData['modules'],
                    'estimated_duration' => $this->calculateEstimatedDuration($courseData['modules']),
                    'activities_count' => $this->countActivities($courseData['modules']),
                    'quiz_count' => $this->countActivitiesByType($courseData['modules'], 'quiz'),
                    'reading_count' => $this->countActivitiesByType($courseData['modules'], 'reading'),
                    'assignment_count' => $this->countActivitiesByType($courseData['modules'], 'assignment')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Course preview generation failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar preview: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateEstimatedDuration(array $modules): string
    {
        $totalMinutes = 0;
        
        foreach ($modules as $module) {
            foreach ($module['activities'] as $activity) {
                $totalMinutes += $activity['duration_minutes'] ?? 30;
            }
        }
        
        $hours = intval($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        
        if ($hours > 24) {
            $days = intval($hours / 8); // 8 hours of study per day
            return $days . ' dias de estudo';
        } elseif ($hours > 0) {
            return $hours . 'h' . ($minutes > 0 ? ' ' . $minutes . 'min' : '');
        } else {
            return $minutes . ' minutos';
        }
    }

    private function countActivities(array $modules): int
    {
        $count = 0;
        foreach ($modules as $module) {
            $count += count($module['activities']);
        }
        return $count;
    }

    private function countActivitiesByType(array $modules, string $type): int
    {
        $count = 0;
        foreach ($modules as $module) {
            foreach ($module['activities'] as $activity) {
                if ($activity['type'] === $type) {
                    $count++;
                }
            }
        }
        return $count;
    }
}
