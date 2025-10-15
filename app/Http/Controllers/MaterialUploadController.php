<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMaterial;
use App\Services\AICourseGeneratorService;
use App\Services\GeminiAIService;
use App\Services\MaterialContentExtractor;
use App\Http\Requests\UploadMaterialRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialUploadController extends Controller
{
    protected $aiCourseGenerator;
    protected $geminiAIService;
    protected $contentExtractor;

    public function __construct(
        AICourseGeneratorService $aiCourseGenerator,
        GeminiAIService $geminiAIService,
        MaterialContentExtractor $contentExtractor
    ) {
        $this->middleware('auth');
        $this->aiCourseGenerator = $aiCourseGenerator;
        $this->geminiAIService = $geminiAIService;
        $this->contentExtractor = $contentExtractor;
    }

    /**
     * Show upload interface for a course
     */
    public function show(Course $course)
    {
        $this->authorize('update', $course);

        $materials = $course->materials()->latest()->get();

        return Inertia::render('Materials/Upload', [
            'course' => $course,
            'materials' => $materials,
            'canGenerate' => $materials->count() > 0,
        ]);
    }

    /**
     * Upload and process material
     */
    public function upload(UploadMaterialRequest $request, Course $course)
    {
        // Authorization is already handled by UploadMaterialRequest
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Store the uploaded file
            $file = $request->file('material');
            $filePath = $file->store('course-materials', 'public');

            Log::info('🚀 Material upload initiated', [
                'course_id' => $course->id,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'user_id' => Auth::id(),
            ]);

            // Create course material record
            $material = CourseMaterial::create([
                'course_id' => $course->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'original_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
                'instructor_id' => Auth::id(),
                'is_active' => true,
            ]);

            DB::commit();

            Log::info('✅ Material uploaded successfully', [
                'material_id' => $material->id,
                'course_id' => $course->id,
            ]);

            // Auto-generate activities if requested
            if ($request->boolean('auto_generate')) {
                return $this->generateActivitiesFromMaterial($material, $course);
            }

            return response()->json([
                'success' => true,
                'material' => $material,
                'message' => 'Material enviado com sucesso!',
                'redirect' => route('materials.upload.show', $course),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up uploaded file if exists
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            Log::error('❌ Error uploading material', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao enviar material: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate activities from existing material
     */
    public function generateActivities(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'material_id' => 'required|exists:course_materials,id',
        ]);

        try {
            $material = CourseMaterial::where('id', $validated['material_id'])
                                   ->where('course_id', $course->id)
                                   ->firstOrFail();

            return $this->generateActivitiesFromMaterial($material, $course);

        } catch (\Exception $e) {
            Log::error('❌ Error generating activities', [
                'course_id' => $course->id,
                'material_id' => $validated['material_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao gerar atividades: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Private method to generate activities from material
     */
    private function generateActivitiesFromMaterial(CourseMaterial $material, Course $course)
    {
        try {
            Log::info('🤖 Starting AI activity generation', [
                'material_id' => $material->id,
                'course_id' => $course->id,
            ]);

            // Extract content from material
            $extractedContent = $this->contentExtractor->extractContent($material);

            Log::info('📄 Content extracted from material', [
                'word_count' => $extractedContent['word_count'] ?? 0,
                'sections_count' => count($extractedContent['sections'] ?? []),
            ]);

            // Generate course using Gemini AI
            $courseData = $this->geminiAIService->generateCourseFromContent(
                $extractedContent['clean_text'] ?? '',
                $course->title,
                'Público geral',
                'intermediate'
            );

            // Create activities using AI Course Generator
            $result = $this->aiCourseGenerator->generateCourseFromMaterial($material, $course);

            if ($result['success']) {
                Log::info('✅ Activities generated successfully', [
                    'activities_created' => count($result['activities']),
                    'badges_created' => count($result['badges']),
                ]);

                return response()->json([
                    'success' => true,
                    'activities_created' => count($result['activities']),
                    'badges_created' => count($result['badges']),
                    'extracted_content' => $extractedContent,
                    'message' => sprintf(
                        'IA gerou automaticamente %d atividades e %d badges!',
                        count($result['activities']),
                        count($result['badges'])
                    ),
                    'redirect' => route('courses.show', $course),
                ]);
            }

            throw new \Exception($result['error'] ?? 'Falha na geração de atividades');

        } catch (\Exception $e) {
            Log::error('❌ Error in AI generation process', [
                'material_id' => $material->id,
                'course_id' => $course->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro na geração automática: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview material content
     */
    public function preview(CourseMaterial $material)
    {
        $this->authorize('view', $material);

        try {
            // Extract content for preview
            $extractedContent = $this->contentExtractor->extractContent($material);

            return response()->json([
                'success' => true,
                'content' => [
                    'title' => $material->title,
                    'word_count' => $extractedContent['word_count'] ?? 0,
                    'sections' => array_slice($extractedContent['sections'] ?? [], 0, 5), // First 5 sections
                    'clean_text_preview' => substr($extractedContent['clean_text'] ?? '', 0, 1000), // First 1000 chars
                    'estimated_reading_time' => $extractedContent['estimated_reading_time'] ?? 0,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error previewing material', [
                'material_id' => $material->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao visualizar material: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete material
     */
    public function delete(CourseMaterial $material)
    {
        $this->authorize('delete', $material);

        try {
            DB::beginTransaction();

            // Delete physical file
            if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }

            $courseId = $material->course_id;
            $material->delete();

            DB::commit();

            Log::info('✅ Material deleted successfully', [
                'material_id' => $material->id,
                'course_id' => $courseId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Material excluído com sucesso!',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('❌ Error deleting material', [
                'material_id' => $material->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao excluir material: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate file before upload
     */
    public function validateFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,txt,ppt,pptx|max:10240',
        ]);

        $file = $request->file('file');

        return response()->json([
            'success' => true,
            'file_info' => [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'size_formatted' => $this->formatFileSize($file->getSize()),
                'type' => $file->getClientMimeType(),
                'extension' => $file->getClientOriginalExtension(),
            ],
        ]);
    }

    /**
     * Format file size for display
     */
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
}