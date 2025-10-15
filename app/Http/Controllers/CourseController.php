<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Activity;
use App\Models\CourseEnrollment;
use App\Services\AICourseGeneratorService;
use App\Services\GeminiAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CourseController extends Controller
{
    protected $aiCourseGenerator;
    protected $geminiAIService;

    public function __construct(AICourseGeneratorService $aiCourseGenerator, GeminiAIService $geminiAIService)
    {
        $this->middleware('auth');
        $this->aiCourseGenerator = $aiCourseGenerator;
        $this->geminiAIService = $geminiAIService;
    }

    /**
     * Display a listing of courses
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Base query for courses
        $query = Course::with(['instructor', 'enrollments', 'activities'])
                      ->withCount(['enrollments', 'activities']);

        // Filter by instructor if user is instructor
        if ($user->role === 'instructor') {
            $query->where('instructor_id', $user->id);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Pagination
        $courses = $query->latest()->paginate(12);

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'filters' => $request->only(['search', 'status']),
            'canCreate' => $user->role === 'instructor' || $user->role === 'admin',
        ]);
    }

    /**
     * Show the form for creating a new course
     */
    public function create()
    {
        $this->authorize('create', Course::class);

        return Inertia::render('Courses/Create');
    }

    /**
     * Store a newly created course
     */
    public function store(Request $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,archived',
            'points_per_completion' => 'required|integer|min:1|max:1000',
        ]);

        try {
            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('course-images', 'public');
                $validated['image'] = $imagePath;
            }

            // Add instructor ID and tenant_id
            $validated['instructor_id'] = Auth::id();
            $validated['tenant_id'] = Auth::user()->tenant_id;

            $course = Course::create($validated);

            Log::info('Course created successfully', [
                'course_id' => $course->id,
                'title' => $course->title,
                'instructor_id' => $course->instructor_id
            ]);

            return redirect()->route('courses.show', $course)
                           ->with('success', 'Curso criado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Error creating course', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors(['error' => 'Erro ao criar curso: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified course
     */
    public function show(Course $course)
    {
        $this->authorize('view', $course);

        $course->load([
            'instructor',
            'activities' => function($query) {
                $query->orderBy('order');
            },
            'materials',
            'enrollments.user'
        ]);

        $user = Auth::user();
        $userEnrollment = null;
        $userProgress = null;

        // Check if user is enrolled
        if ($user->role === 'student') {
            $userEnrollment = CourseEnrollment::where('course_id', $course->id)
                                             ->where('user_id', $user->id)
                                             ->first();

            if ($userEnrollment) {
                $userProgress = $this->calculateUserProgress($course, $user);
            }
        }

        // Calculate course statistics
        $stats = [
            'total_students' => $course->enrollments_count,
            'total_activities' => $course->activities_count,
            'completion_rate' => $course->completion_rate,
            'average_rating' => 4.5, // TODO: Implement rating system
        ];

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'userEnrollment' => $userEnrollment,
            'userProgress' => $userProgress,
            'stats' => $stats,
            'canEdit' => $user->can('update', $course),
            'canDelete' => $user->can('delete', $course),
        ]);
    }

    /**
     * Show the form for editing the specified course
     */
    public function edit(Course $course)
    {
        $this->authorize('update', $course);

        $course->load(['activities' => function($query) {
            $query->orderBy('order');
        }, 'materials']);

        return Inertia::render('Courses/Edit', [
            'course' => $course,
        ]);
    }

    /**
     * Update the specified course
     */
    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,archived',
            'points_per_completion' => 'required|integer|min:1|max:1000',
        ]);

        try {
            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($course->image) {
                    Storage::disk('public')->delete($course->image);
                }

                $imagePath = $request->file('image')->store('course-images', 'public');
                $validated['image'] = $imagePath;
            }

            $course->update($validated);

            Log::info('Course updated successfully', [
                'course_id' => $course->id,
                'title' => $course->title,
                'updated_by' => Auth::id()
            ]);

            return redirect()->route('courses.show', $course)
                           ->with('success', 'Curso atualizado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Error updating course', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors(['error' => 'Erro ao atualizar curso: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified course from storage
     */
    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);

        try {
            // Delete associated files
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }

            // Delete course materials
            foreach ($course->materials as $material) {
                if ($material->file_path) {
                    Storage::disk('public')->delete($material->file_path);
                }
            }

            $courseTitle = $course->title;
            $course->delete();

            Log::info('Course deleted successfully', [
                'course_title' => $courseTitle,
                'deleted_by' => Auth::id()
            ]);

            return redirect()->route('courses.index')
                           ->with('success', 'Curso excluído com sucesso!');

        } catch (\Exception $e) {
            Log::error('Error deleting course', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors(['error' => 'Erro ao excluir curso: ' . $e->getMessage()]);
        }
    }

    /**
     * Duplicate a course
     */
    public function duplicate(Course $course)
    {
        $this->authorize('create', Course::class);

        try {
            $newCourse = $course->replicate();
            $newCourse->title = $course->title . ' (Cópia)';
            $newCourse->status = 'draft';
            $newCourse->instructor_id = Auth::id();
            $newCourse->save();

            // Duplicate activities
            foreach ($course->activities as $activity) {
                $newActivity = $activity->replicate();
                $newActivity->course_id = $newCourse->id;
                $newActivity->save();
            }

            Log::info('Course duplicated successfully', [
                'original_course_id' => $course->id,
                'new_course_id' => $newCourse->id,
                'duplicated_by' => Auth::id()
            ]);

            return redirect()->route('courses.show', $newCourse)
                           ->with('success', 'Curso duplicado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Error duplicating course', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors(['error' => 'Erro ao duplicar curso: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate course from AI
     */
    public function generateFromAI(Request $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'description' => 'required|string|min:10|max:500',
            'target_audience' => 'nullable|string|max:100',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
        ]);

        try {
            Log::info('Starting AI course generation', [
                'description' => $validated['description'],
                'user_id' => Auth::id()
            ]);

            $courseData = $this->geminiAIService->generateCourse(
                $validated['description'],
                $validated['target_audience'],
                $validated['difficulty']
            );

            // Create course from AI data
            $course = Course::create([
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'status' => 'draft',
                'points_per_completion' => 100,
                'instructor_id' => Auth::id(),
                'tenant_id' => Auth::user()->tenant_id,
            ]);

            // Create activities from AI data
            if (isset($courseData['modules'])) {
                $order = 1;
                foreach ($courseData['modules'] as $module) {
                    if (isset($module['lessons'])) {
                        foreach ($module['lessons'] as $lesson) {
                            Activity::create([
                                'course_id' => $course->id,
                                'tenant_id' => Auth::user()->tenant_id,
                                'title' => $lesson['title'],
                                'description' => substr($lesson['content'], 0, 255),
                                'type' => 'reading',
                                'content' => [
                                    'module' => $module['title'],
                                    'content' => $lesson['content'],
                                    'duration_minutes' => $lesson['duration_minutes'] ?? 30,
                                ],
                                'points_value' => 10,
                                'duration_minutes' => $lesson['duration_minutes'] ?? 30,
                                'is_required' => true,
                                'is_active' => true,
                                'order' => $order++,
                            ]);
                        }
                    }
                }
            }

            Log::info('AI course generated successfully', [
                'course_id' => $course->id,
                'activities_created' => $order - 1,
            ]);

            return response()->json([
                'success' => true,
                'course' => $course,
                'redirect' => route('courses.show', $course),
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating course from AI', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao gerar curso: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload material and generate course
     */
    public function uploadMaterial(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'material' => 'required|file|mimes:pdf,doc,docx,txt|max:10240', // 10MB max
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'generate_activities' => 'boolean',
        ]);

        try {
            // Store the uploaded file
            $file = $request->file('material');
            $filePath = $file->store('course-materials', 'public');

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
            ]);

            // Generate activities if requested
            if ($request->boolean('generate_activities')) {
                $result = $this->aiCourseGenerator->generateCourseFromMaterial($material, $course);

                if ($result['success']) {
                    Log::info('Activities generated from material', [
                        'course_id' => $course->id,
                        'material_id' => $material->id,
                        'activities_created' => count($result['activities']),
                    ]);

                    return response()->json([
                        'success' => true,
                        'material' => $material,
                        'activities_generated' => count($result['activities']),
                        'badges_generated' => count($result['badges']),
                        'message' => 'Material enviado e atividades geradas com sucesso!',
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'material' => $material,
                'message' => 'Material enviado com sucesso!',
            ]);

        } catch (\Exception $e) {
            Log::error('Error uploading material', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao enviar material: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate user progress in course
     */
    private function calculateUserProgress(Course $course, $user)
    {
        $totalActivities = $course->activities()->count();
        if ($totalActivities === 0) {
            return [
                'percentage' => 0,
                'completed_activities' => 0,
                'total_activities' => 0,
            ];
        }

        $completedActivities = $course->activities()
            ->whereHas('userActivities', function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->whereNotNull('completed_at');
            })->count();

        return [
            'percentage' => round(($completedActivities / $totalActivities) * 100, 2),
            'completed_activities' => $completedActivities,
            'total_activities' => $totalActivities,
        ];
    }

    /**
     * Publish course
     */
    public function publish(Course $course)
    {
        $this->authorize('update', $course);

        if ($course->activities()->count() === 0) {
            return back()->withErrors(['error' => 'Não é possível publicar um curso sem atividades.']);
        }

        $course->update(['status' => 'published']);

        Log::info('Course published', [
            'course_id' => $course->id,
            'published_by' => Auth::id()
        ]);

        return back()->with('success', 'Curso publicado com sucesso!');
    }

    /**
     * Archive course
     */
    public function archive(Course $course)
    {
        $this->authorize('update', $course);

        $course->update(['status' => 'archived']);

        Log::info('Course archived', [
            'course_id' => $course->id,
            'archived_by' => Auth::id()
        ]);

        return back()->with('success', 'Curso arquivado com sucesso!');
    }
}