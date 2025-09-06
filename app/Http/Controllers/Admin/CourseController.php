<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\Activity;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['instructor', 'activities']);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by instructor
        if ($request->filled('instructor')) {
            $query->where('instructor_id', $request->instructor);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $courses = $query->paginate(15)
            ->withQueryString()
            ->through(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'status' => $course->status,
                    'points_per_completion' => $course->points_per_completion,
                    'instructor' => $course->instructor ? [
                        'id' => $course->instructor->id,
                        'name' => $course->instructor->name,
                    ] : null,
                    'activities_count' => $course->activities->count(),
                    'enrollments_count' => CourseEnrollment::where('course_id', $course->id)->count(),
                    'completion_rate' => $this->getCompletionRate($course->id),
                    'created_at' => $course->created_at,
                ];
            });

        $instructors = User::where('role', 'instructor')->get(['id', 'name']);

        $stats = [
            'total' => Course::count(),
            'published' => Course::where('status', 'published')->count(),
            'draft' => Course::where('status', 'draft')->count(),
            'enrollments' => CourseEnrollment::count(),
        ];

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'instructors' => $instructors,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'instructor', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $instructors = User::where('role', 'instructor')->get(['id', 'name']);

        return Inertia::render('Admin/Courses/Create', [
            'instructors' => $instructors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructor_id' => 'required|exists:users,id',
            'points_per_completion' => 'required|integer|min:0',
            'status' => 'required|in:draft,published,archived',
        ]);

        // Debug log to see what we received
        \Log::info('Course creation request:', $request->all());

        Course::create($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Curso criado com sucesso!');
    }

    public function show(Course $course)
    {
        $course->load(['instructor', 'activities.userActivities', 'enrollments.user']);

        $stats = [
            'enrollments_count' => $course->enrollments->count(),
            'completed_count' => $course->enrollments->whereNotNull('completed_at')->count(),
            'activities_count' => $course->activities->count(),
            'avg_progress' => $course->enrollments->avg('progress_percentage') ?? 0,
            'completion_rate' => $this->getCompletionRate($course->id),
        ];

        $recentEnrollments = $course->enrollments()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'stats' => $stats,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }

    public function edit(Course $course)
    {
        $instructors = User::where('role', 'instructor')->get(['id', 'name']);

        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'instructors' => $instructors,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructor_id' => 'required|exists:users,id',
            'points_per_completion' => 'required|integer|min:0',
            'status' => 'required|in:draft,published,archived',
            'image' => 'nullable|image|max:2048',
        ]);

        $courseData = [
            'title' => $request->title,
            'description' => $request->description,
            'instructor_id' => $request->instructor_id,
            'points_per_completion' => $request->points_per_completion,
            'status' => $request->status,
        ];

        if ($request->hasFile('image')) {
            // Delete old image
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            $courseData['image'] = $request->file('image')->store('courses', 'public');
        }

        $course->update($courseData);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Curso atualizado com sucesso!');
    }

    public function destroy(Course $course)
    {
        // Check if course has enrollments
        $enrollmentCount = $course->enrollments()->count();
        
        if ($enrollmentCount > 0) {
            return redirect()->route('admin.courses.index')
                ->with('error', "Não é possível excluir o curso pois ele possui {$enrollmentCount} matrícula(s).");
        }

        // Delete image if exists
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Curso excluído com sucesso!');
    }

    private function getCompletionRate($courseId)
    {
        $totalEnrollments = CourseEnrollment::where('course_id', $courseId)->count();
        if ($totalEnrollments === 0) return 0;

        $completedEnrollments = CourseEnrollment::where('course_id', $courseId)
            ->whereNotNull('completed_at')
            ->count();

        return round(($completedEnrollments / $totalEnrollments) * 100, 1);
    }
}