<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class PythonAIService
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = env('PYTHON_AI_SERVICE_URL', 'http://localhost:8001');
        $this->timeout = 300; // 5 minutes (increased for Final Challenge generation)
    }

    /**
     * Generate course from PDF using Python AI microservice
     */
    public function generateCourseFromPDF(
        UploadedFile $pdfFile,
        string $title,
        string $difficulty = 'intermediate',
        ?string $targetAudience = null,
        bool $premiumQuality = false,
        string $provider = 'auto'
    ): array {
        Log::info('🐍 [Python AI] Calling microservice for course generation', [
            'title' => $title,
            'difficulty' => $difficulty,
            'file_size' => $pdfFile->getSize(),
            'premium' => $premiumQuality,
            'provider' => $provider
        ]);

        try {
            $response = Http::timeout($this->timeout)
                ->attach('file', fopen($pdfFile->getRealPath(), 'r'), $pdfFile->getClientOriginalName())
                ->post($this->baseUrl . '/api/v1/generate/course', [
                    'title' => $title,
                    'difficulty' => $difficulty,
                    'target_audience' => $targetAudience,
                    'premium_quality' => $premiumQuality,
                    'provider' => $provider // Use specified provider or 'auto'
                ]);

            if (!$response->successful()) {
                Log::error('❌ [Python AI] Request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new \Exception('Python AI Service returned error: ' . $response->body());
            }

            $data = $response->json();

            Log::info('✅ [Python AI] Course generated successfully', [
                'provider' => $data['metadata']['provider'] ?? 'unknown',
                'cost' => $data['metadata']['cost_usd'] ?? 0,
                'confidence' => $data['metadata']['confidence_score'] ?? 0,
                'time_ms' => $data['metadata']['generation_time_ms'] ?? 0,
                'modules' => count($data['course_data']['modules'] ?? [])
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('❌ [Python AI] Exception occurred', [
                'error' => $e->getMessage(),
                'title' => $title
            ]);

            throw $e;
        }
    }

    public function generateQuiz($content, $title, $difficulty = 'intermediate')
    {
        try {
            $response = Http::timeout(120)->post($this->baseUrl . '/api/v1/generate/quiz', [
                'content' => $content,
                'title' => $title,
                'difficulty' => $difficulty
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('Quiz generation failed: ' . $response->body());
        } catch (\Exception $e) {
            \Log::error('PythonAIService::generateQuiz failed', [
                'error' => $e->getMessage(),
                'title' => $title
            ]);
            throw $e;
        }
    }

    /**
     * Generate Final Challenge questions (30 questions: 10 easy, 10 medium, 10 hard)
     *
     * @param int $courseId Course ID
     * @param string $courseTitle Course title
     * @param string $courseContent Full course content
     * @param array $courseModules Array of course modules
     * @return array Response with easy_questions, medium_questions, hard_questions
     */
    public function generateFinalChallengeQuestions(
        int $courseId,
        string $courseTitle,
        string $courseContent,
        array $courseModules
    ): array {
        Log::info('🎯 [Python AI] Generating Final Challenge questions', [
            'course_id' => $courseId,
            'course_title' => $courseTitle,
            'modules_count' => count($courseModules)
        ]);

        try {
            $response = Http::timeout($this->timeout)
                ->post($this->baseUrl . '/api/v1/generate/final-challenge', [
                    'course_id' => $courseId,
                    'course_title' => $courseTitle,
                    'course_content' => $courseContent,
                    'course_modules' => $courseModules
                ]);

            if (!$response->successful()) {
                Log::error('❌ [Python AI] Final Challenge generation failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                throw new \Exception('Python AI Service returned error: ' . $response->body());
            }

            $data = $response->json();

            Log::info('✅ [Python AI] Final Challenge generated successfully', [
                'easy_questions' => count($data['easy_questions'] ?? []),
                'medium_questions' => count($data['medium_questions'] ?? []),
                'hard_questions' => count($data['hard_questions'] ?? []),
                'time_ms' => $data['generation_time_ms'] ?? 0
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('❌ [Python AI] Final Challenge exception', [
                'error' => $e->getMessage(),
                'course_id' => $courseId
            ]);

            throw $e;
        }
    }

    /**
     * Check if Python AI service is healthy
     */
    public function healthCheck(): array
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/health');

            return [
                'available' => $response->successful(),
                'status' => $response->json('status'),
                'providers' => $response->json('providers', [])
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test endpoint
     */
    public function test(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/api/v1/test');
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
