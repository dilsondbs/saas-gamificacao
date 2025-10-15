<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    /**
     * Homepage da loja do tenant
     */
    public function homepage()
    {
        // Pegar cursos em destaque (publicados)
        $featuredCourses = Course::where('status', 'published')
            ->with(['instructor:id,name'])
            ->withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->take(6)
            ->get();

        // Estatísticas da plataforma
        $stats = [
            'total_courses' => Course::where('status', 'published')->count(),
            'total_students' => \App\Models\User::where('role', 'student')->count(),
            'total_instructors' => \App\Models\User::where('role', 'instructor')->count(),
            'completion_rate' => 85 // Valor exemplo - calcular depois
        ];

        return Inertia::render('Public/Homepage', [
            'featuredCourses' => $featuredCourses,
            'stats' => $stats
        ]);
    }

    /**
     * Catálogo completo de cursos
     */
    public function catalog(Request $request)
    {
        $query = Course::where('status', 'published')
            ->with(['instructor:id,name'])
            ->withCount('enrollments');

        // Filtro por busca
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Ordenação
        $sortBy = $request->get('sort', 'popular');
        switch ($sortBy) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'name':
                $query->orderBy('title', 'asc');
                break;
            case 'popular':
            default:
                $query->orderBy('enrollments_count', 'desc');
                break;
        }

        $courses = $query->paginate(12);

        return Inertia::render('Public/Catalog', [
            'courses' => $courses,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortBy
            ]
        ]);
    }

    /**
     * Página individual do curso
     */
    public function course($slug)
    {
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->with([
                'instructor:id,name,email',
                'activities' => function($query) {
                    $query->where('is_active', true)
                          ->orderBy('order', 'asc')
                          ->select('id', 'course_id', 'title', 'type', 'points_value', 'duration_minutes');
                }
            ])
            ->withCount(['enrollments', 'activities'])
            ->firstOrFail();

        // Verificar se usuário já está matriculado
        $isEnrolled = auth()->check() 
            ? \App\Models\CourseEnrollment::where('user_id', auth()->id())
                ->where('course_id', $course->id)
                ->exists()
            : false;

        // Cursos relacionados
        $relatedCourses = Course::where('status', 'published')
            ->where('id', '!=', $course->id)
            ->with('instructor:id,name')
            ->withCount('enrollments')
            ->take(3)
            ->get();

        return Inertia::render('Public/Course', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'relatedCourses' => $relatedCourses
        ]);
    }

    /**
     * Processo de matrícula/compra
     */
    public function enroll(Course $course)
    {
        // Verificar se usuário está logado
        if (!auth()->check()) {
            return redirect()->route('login')
                ->with('message', 'Faça login para se matricular no curso.');
        }

        // Verificar se já está matriculado
        $existingEnrollment = \App\Models\CourseEnrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return redirect()->route('public.course', $course->slug)
                ->with('message', 'Você já está matriculado neste curso!');
        }

        // Por enquanto, matricula gratuita (depois implementar pagamento)
        \App\Models\CourseEnrollment::create([
            'user_id' => auth()->id(),
            'course_id' => $course->id,
            'enrolled_at' => now()
        ]);

        return redirect()->route('student.courses.show', $course->id)
            ->with('message', 'Parabéns! Você foi matriculado no curso.');
    }
}
