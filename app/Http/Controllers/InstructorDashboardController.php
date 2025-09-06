<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use App\Models\Activity;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstructorDashboardController extends Controller
{
    public function dashboard(): Response
    {
        try {
            $instructor = auth()->user();
            
            if (!$instructor) {
                return redirect()->route('login');
            }
            
            // Get real data from database for this instructor
            $instructorId = $instructor->id;
            
            $stats = [
                'total_courses' => Course::where('instructor_id', $instructorId)->count(),
                'total_students' => CourseEnrollment::whereHas('course', function($q) use ($instructorId) {
                    $q->where('instructor_id', $instructorId);
                })->distinct('user_id')->count('user_id'),
                'total_activities' => Activity::whereHas('course', function($q) use ($instructorId) {
                    $q->where('instructor_id', $instructorId);
                })->count(),
                'total_completions' => UserActivity::whereHas('activity.course', function($q) use ($instructorId) {
                    $q->where('instructor_id', $instructorId);
                })->whereNotNull('completed_at')->count(),
            ];
            
            $recentEnrollments = [];
            $courseMetrics = [];
            
            return Inertia::render('Instructor/Dashboard', [
                'stats' => $stats,
                'recentEnrollments' => $recentEnrollments,
                'courseMetrics' => $courseMetrics,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in instructor dashboard: ' . $e->getMessage());
            
            // Return basic safe data in case of error
            return Inertia::render('Instructor/Dashboard', [
                'stats' => [
                    'total_courses' => 0,
                    'total_students' => 0,
                    'total_activities' => 0,
                    'total_completions' => 0,
                ],
                'recentEnrollments' => [],
                'courseMetrics' => [],
            ]);
        }
    }
    
    public function courses(): Response
    {
        try {
            $instructor = auth()->user();
            
            if (!$instructor) {
                return redirect()->route('login');
            }
            
            $courses = Course::where('instructor_id', $instructor->id)
                ->withCount(['enrollments', 'activities'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            $stats = [
                'total' => $courses->count(),
                'published' => $courses->where('is_active', true)->count(),
                'draft' => $courses->where('is_active', false)->count(),
            ];
            
            return Inertia::render('Instructor/Courses/Index', [
                'courses' => $courses,
                'stats' => $stats,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in instructor courses: ' . $e->getMessage());
            
            return Inertia::render('Instructor/Courses/Index', [
                'courses' => [],
                'stats' => [
                    'total' => 0,
                    'published' => 0,
                    'draft' => 0,
                ],
            ]);
        }
    }
    
    public function students(Request $request): Response
    {
        try {
            $instructor = auth()->user();
            
            if (!$instructor) {
                return redirect()->route('login');
            }
            
            $courseIds = Course::where('instructor_id', $instructor->id)->pluck('id');
            
            if ($courseIds->isEmpty()) {
                return Inertia::render('Instructor/Students/Index', [
                    'students' => [],
                    'courses' => [],
                    'stats' => [
                        'total_students' => 0,
                        'avg_progress' => 0,
                        'completed_courses' => 0,
                    ],
                    'filters' => [
                        'search' => $request->search,
                        'course' => $request->course,
                    ],
                ]);
            }
            
            $query = CourseEnrollment::with(['user', 'course'])
                ->whereIn('course_id', $courseIds);
            
            // Filter by course if specified
            if ($request->filled('course')) {
                $query->where('course_id', $request->course);
            }
            
            // Search by student name
            if ($request->filled('search')) {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }
            
            $enrollments = $query->orderBy('created_at', 'desc')->get();
            
            // Add progress information for each student
            $studentsWithProgress = $enrollments->map(function ($enrollment) {
                try {
                    $totalActivities = $enrollment->course->activities()->count();
                    $completedActivities = UserActivity::whereHas('activity', function($query) use ($enrollment) {
                        $query->where('course_id', $enrollment->course_id);
                    })->where('user_id', $enrollment->user_id)->completed()->count();
                    
                    $progress = $totalActivities > 0 
                        ? round(($completedActivities / $totalActivities) * 100, 1)
                        : 0;
                    
                    return [
                        'id' => $enrollment->id,
                        'user' => $enrollment->user,
                        'course' => $enrollment->course,
                        'enrolled_at' => $enrollment->created_at,
                        'progress' => $progress,
                        'completed_activities' => $completedActivities,
                        'total_activities' => $totalActivities,
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error calculating student progress for enrollment ' . $enrollment->id . ': ' . $e->getMessage());
                    return [
                        'id' => $enrollment->id,
                        'user' => $enrollment->user,
                        'course' => $enrollment->course,
                        'enrolled_at' => $enrollment->created_at,
                        'progress' => 0,
                        'completed_activities' => 0,
                        'total_activities' => 0,
                    ];
                }
            });
            
            $courses = Course::where('instructor_id', $instructor->id)->get(['id', 'title']);
            
            $stats = [
                'total_students' => $studentsWithProgress->count(),
                'avg_progress' => $studentsWithProgress->avg('progress') ?: 0,
                'completed_courses' => $studentsWithProgress->where('progress', 100)->count(),
            ];
            
            return Inertia::render('Instructor/Students/Index', [
                'students' => $studentsWithProgress,
                'courses' => $courses,
                'stats' => $stats,
                'filters' => [
                    'search' => $request->search,
                    'course' => $request->course,
                ],
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in instructor students: ' . $e->getMessage());
            
            return Inertia::render('Instructor/Students/Index', [
                'students' => [],
                'courses' => [],
                'stats' => [
                    'total_students' => 0,
                    'avg_progress' => 0,
                    'completed_courses' => 0,
                ],
                'filters' => [
                    'search' => $request->search,
                    'course' => $request->course,
                ],
            ]);
        }
    }

    // CRUD methods for courses
    public function showCourse(Course $course)
    {
        // Check if instructor owns this course
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $course->load(['activities', 'enrollments', 'materials']);
        
        return Inertia::render('Instructor/Courses/Show', [
            'course' => $course,
        ]);
    }
    
    public function createCourse()
    {
        return Inertia::render('Instructor/Courses/Create');
    }
    
    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        $validated['instructor_id'] = auth()->id();
        
        $course = Course::create($validated);
        
        return redirect()->route('instructor.courses.show', $course)
            ->with('success', 'Curso criado com sucesso!');
    }
    
    public function editCourse(Course $course)
    {
        // Check if instructor owns this course
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        return Inertia::render('Instructor/Courses/Edit', [
            'course' => $course,
        ]);
    }
    
    public function updateCourse(Request $request, Course $course)
    {
        // Check if instructor owns this course
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        $course->update($validated);
        
        return redirect()->route('instructor.courses.show', $course)
            ->with('success', 'Curso atualizado com sucesso!');
    }
    
    public function destroyCourse(Course $course)
    {
        // Check if instructor owns this course
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $course->delete();
        
        return redirect()->route('instructor.courses')
            ->with('success', 'Curso excluído com sucesso!');
    }

    // CRUD methods for activities
    public function activities(Request $request)
    {
        $instructor = auth()->user();
        
        if (!$instructor) {
            return redirect()->route('login');
        }
        
        // Get all courses from this instructor
        $courseIds = Course::where('instructor_id', $instructor->id)->pluck('id');
        
        if ($courseIds->isEmpty()) {
            return Inertia::render('Instructor/Activities/Index', [
                'activities' => [],
                'courses' => [],
                'stats' => [
                    'total_activities' => 0,
                    'by_type' => [],
                ],
                'filters' => [
                    'search' => $request->search,
                    'course' => $request->course,
                    'type' => $request->type,
                ],
            ]);
        }
        
        $query = Activity::with(['course'])
            ->whereIn('course_id', $courseIds);
        
        // Filter by search term
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        // Filter by course
        if ($request->filled('course')) {
            $query->where('course_id', $request->course);
        }
        
        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        $activities = $query->orderBy('created_at', 'desc')->get();
        $courses = Course::where('instructor_id', $instructor->id)->get(['id', 'title']);
        
        // Statistics
        $allActivities = Activity::whereIn('course_id', $courseIds)->get();
        $stats = [
            'total_activities' => $allActivities->count(),
            'by_type' => $allActivities->groupBy('type')->map->count(),
        ];
        
        return Inertia::render('Instructor/Activities/Index', [
            'activities' => $activities,
            'courses' => $courses,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'course' => $request->course,
                'type' => $request->type,
            ],
        ]);
    }
    
    public function createActivity(Request $request)
    {
        $instructor = auth()->user();
        $courses = Course::where('instructor_id', $instructor->id)->get(['id', 'title']);
        
        return Inertia::render('Instructor/Activities/Create', [
            'courses' => $courses,
            'preselected_course' => $request->course_id,
        ]);
    }
    
    public function createActivityForCourse(Course $course)
    {
        // Check if instructor owns this course
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $instructor = auth()->user();
        $courses = Course::where('instructor_id', $instructor->id)->get(['id', 'title']);
        
        return Inertia::render('Instructor/Activities/Create', [
            'courses' => $courses,
            'preselected_course' => $course->id,
        ]);
    }
    
    public function storeActivity(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,quiz,reading,assignment,project',
            'points_value' => 'required|integer|min:0|max:1000',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'content' => 'nullable|array',
        ]);
        
        // Check if instructor owns the course
        $course = Course::findOrFail($validated['course_id']);
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        // Set order as next in sequence for this course
        $nextOrder = Activity::where('course_id', $validated['course_id'])->max('order') + 1;
        $validated['order'] = $nextOrder;
        
        $activity = Activity::create($validated);
        
        return redirect()->route('instructor.activities.show', $activity)
            ->with('success', 'Atividade criada com sucesso!');
    }
    
    public function showActivity(Activity $activity)
    {
        // Check if instructor owns this activity's course
        if ($activity->course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $activity->load(['course', 'userActivities.user']);
        
        // Get completion statistics
        $totalStudents = $activity->course->enrollments()->count();
        $completedCount = $activity->userActivities()->whereNotNull('completed_at')->count();
        $averageScore = $activity->userActivities()->whereNotNull('completed_at')->avg('score');
        
        $stats = [
            'total_students' => $totalStudents,
            'completed_count' => $completedCount,
            'completion_rate' => $totalStudents > 0 ? round(($completedCount / $totalStudents) * 100, 1) : 0,
            'average_score' => $averageScore ? round($averageScore, 1) : 0,
        ];
        
        return Inertia::render('Instructor/Activities/Show', [
            'activity' => $activity,
            'stats' => $stats,
        ]);
    }
    
    public function editActivity(Activity $activity)
    {
        // Check if instructor owns this activity's course
        if ($activity->course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $instructor = auth()->user();
        $courses = Course::where('instructor_id', $instructor->id)->get(['id', 'title']);
        
        return Inertia::render('Instructor/Activities/Edit', [
            'activity' => $activity,
            'courses' => $courses,
        ]);
    }
    
    public function updateActivity(Request $request, Activity $activity)
    {
        // Check if instructor owns this activity's course
        if ($activity->course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,quiz,reading,assignment,project',
            'points_value' => 'required|integer|min:0|max:1000',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'content' => 'nullable|array',
        ]);
        
        // Check if new course belongs to instructor
        $course = Course::findOrFail($validated['course_id']);
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $activity->update($validated);
        
        return redirect()->route('instructor.activities.show', $activity)
            ->with('success', 'Atividade atualizada com sucesso!');
    }
    
    public function destroyActivity(Activity $activity)
    {
        // Check if instructor owns this activity's course
        if ($activity->course->instructor_id !== auth()->id()) {
            abort(403, 'Access denied');
        }
        
        $activity->delete();
        
        return redirect()->route('instructor.activities.index')
            ->with('success', 'Atividade excluída com sucesso!');
    }
}
