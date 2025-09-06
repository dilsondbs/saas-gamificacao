<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Course;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with(['course.instructor']);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by course
        if ($request->filled('course')) {
            $query->where('course_id', $request->course);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        
        if ($sortField === 'course') {
            $query->join('courses', 'activities.course_id', '=', 'courses.id')
                  ->orderBy('courses.title', $sortDirection)
                  ->select('activities.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $activities = $query->paginate(15)
            ->withQueryString()
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'points_value' => $activity->points_value,
                    'order' => $activity->order,
                    'is_required' => $activity->is_required,
                    'course' => $activity->course ? [
                        'id' => $activity->course->id,
                        'title' => $activity->course->title,
                        'instructor_name' => $activity->course->instructor->name ?? 'N/A',
                    ] : null,
                    'completions_count' => UserActivity::where('activity_id', $activity->id)
                        ->whereNotNull('completed_at')
                        ->count(),
                    'attempts_count' => UserActivity::where('activity_id', $activity->id)
                        ->count(),
                    'created_at' => $activity->created_at,
                ];
            });

        $courses = Course::with('instructor')->get(['id', 'title', 'instructor_id']);
        
        $stats = [
            'total' => Activity::count(),
            'quiz' => Activity::where('type', 'quiz')->count(),
            'lesson' => Activity::where('type', 'lesson')->count(),
            'assignment' => Activity::where('type', 'assignment')->count(),
            'video' => Activity::where('type', 'video')->count(),
        ];

        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
            'courses' => $courses,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'course', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $courses = Course::with('instructor')->get(['id', 'title', 'instructor_id']);

        return Inertia::render('Admin/Activities/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:lesson,quiz,assignment,video,reading',
            'course_id' => 'required|exists:courses,id',
            'points_value' => 'required|integer|min:0',
            'order' => 'nullable|integer|min:1',
            'is_required' => 'boolean',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Verificar se o curso existe e está ativo
        $course = Course::find($request->course_id);
        if (!$course) {
            return redirect()->back()
                ->withErrors(['course_id' => 'O curso selecionado não existe.'])
                ->withInput();
        }

        if ($course->status === 'archived') {
            return redirect()->back()
                ->withErrors(['course_id' => 'Não é possível criar atividade em curso arquivado.'])
                ->withInput();
        }

        $order = $request->order;
        if (!$order) {
            $order = Activity::where('course_id', $request->course_id)->max('order') + 1;
        }

        // Garantir que todos os campos obrigatórios estejam preenchidos
        $content = null;
        if ($request->content) {
            // Se o conteúdo é uma string JSON válida, mantém como está
            // Se é uma string simples, converte para estrutura JSON
            $trimmedContent = trim($request->content);
            if (json_decode($trimmedContent) !== null && json_last_error() === JSON_ERROR_NONE) {
                $content = $trimmedContent;
            } else {
                // Converte string simples para estrutura JSON básica
                $content = json_encode(['text' => $trimmedContent]);
            }
        }

        $activityData = [
            'title' => trim($request->title),
            'description' => trim($request->description),
            'type' => $request->type,
            'course_id' => (int) $request->course_id,
            'points_value' => (int) $request->points_value,
            'order' => (int) $order,
            'is_required' => $request->boolean('is_required'),
            'content' => $content,
            'duration_minutes' => (int) ($request->duration_minutes ?? 0),
            'is_active' => $request->boolean('is_active', true),
        ];

        try {
            $activity = Activity::create($activityData);
            \Log::info('Atividade criada com sucesso: ', ['id' => $activity->id, 'title' => $activity->title]);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Erro ao criar atividade: ' . $e->getMessage());
            \Log::error('Activity data: ', $activityData);
            
            if (str_contains($e->getMessage(), 'constraint')) {
                return redirect()->back()
                    ->withErrors(['course_id' => 'Erro de integridade: verifique se o curso selecionado existe.'])
                    ->withInput();
            }
            
            if (str_contains($e->getMessage(), 'JSON')) {
                return redirect()->back()
                    ->withErrors(['content' => 'Erro no formato do conteúdo. Verifique se está em formato válido.'])
                    ->withInput();
            }
            
            return redirect()->back()
                ->withErrors(['error' => 'Erro interno ao criar atividade: ' . $e->getMessage()])
                ->withInput();
        } catch (\Exception $e) {
            \Log::error('Erro geral ao criar atividade: ' . $e->getMessage());
            \Log::error('Activity data: ', $activityData);
            
            return redirect()->back()
                ->withErrors(['error' => 'Erro inesperado ao criar atividade: ' . $e->getMessage()])
                ->withInput();
        }

        return redirect()->route('admin.activities.index')
            ->with('success', 'Atividade criada com sucesso!');
    }

    public function show(Activity $activity)
    {
        $activity->load(['course.instructor']);

        $stats = [
            'total_attempts' => UserActivity::where('activity_id', $activity->id)->count(),
            'completed_attempts' => UserActivity::where('activity_id', $activity->id)
                ->whereNotNull('completed_at')
                ->count(),
            'average_score' => UserActivity::where('activity_id', $activity->id)
                ->whereNotNull('score')
                ->avg('score') ?? 0,
            'average_attempts' => UserActivity::where('activity_id', $activity->id)
                ->avg('attempts') ?? 0,
        ];

        $recentAttempts = UserActivity::where('activity_id', $activity->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        return Inertia::render('Admin/Activities/Show', [
            'activity' => $activity,
            'stats' => $stats,
            'recentAttempts' => $recentAttempts,
        ]);
    }

    public function edit(Activity $activity)
    {
        $courses = Course::with('instructor')->get(['id', 'title', 'instructor_id']);

        return Inertia::render('Admin/Activities/Edit', [
            'activity' => $activity,
            'courses' => $courses,
        ]);
    }

    public function update(Request $request, Activity $activity)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:lesson,quiz,assignment,video,reading',
            'course_id' => 'required|exists:courses,id',
            'points_value' => 'required|integer|min:0',
            'order' => 'nullable|integer|min:1',
            'is_required' => 'boolean',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Verificar se o curso existe e está ativo
        $course = Course::find($request->course_id);
        if (!$course) {
            return redirect()->back()
                ->withErrors(['course_id' => 'O curso selecionado não existe.'])
                ->withInput();
        }

        // Garantir que todos os campos obrigatórios estejam preenchidos
        $content = null;
        if ($request->content) {
            // Se o conteúdo é uma string JSON válida, mantém como está
            // Se é uma string simples, converte para estrutura JSON
            $trimmedContent = trim($request->content);
            if (json_decode($trimmedContent) !== null && json_last_error() === JSON_ERROR_NONE) {
                $content = $trimmedContent;
            } else {
                // Converte string simples para estrutura JSON básica
                $content = json_encode(['text' => $trimmedContent]);
            }
        }

        $activityData = [
            'title' => trim($request->title),
            'description' => trim($request->description),
            'type' => $request->type,
            'course_id' => (int) $request->course_id,
            'points_value' => (int) $request->points_value,
            'order' => (int) ($request->order ?? $activity->order),
            'is_required' => $request->boolean('is_required'),
            'content' => $content,
            'duration_minutes' => (int) ($request->duration_minutes ?? $activity->duration_minutes ?? 0),
            'is_active' => $request->boolean('is_active', true),
        ];

        try {
            $activity->update($activityData);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Erro ao atualizar atividade: ' . $e->getMessage());
            
            if (str_contains($e->getMessage(), 'constraint')) {
                return redirect()->back()
                    ->withErrors(['course_id' => 'Erro de integridade: verifique se o curso selecionado existe.'])
                    ->withInput();
            }
            
            return redirect()->back()
                ->withErrors(['error' => 'Erro interno ao atualizar atividade. Tente novamente.'])
                ->withInput();
        }

        return redirect()->route('admin.activities.index')
            ->with('success', 'Atividade atualizada com sucesso!');
    }

    public function destroy(Activity $activity)
    {
        // Check if activity has user attempts
        $attemptsCount = UserActivity::where('activity_id', $activity->id)->count();
        
        if ($attemptsCount > 0) {
            return redirect()->route('admin.activities.index')
                ->with('error', "Não é possível excluir a atividade pois ela possui {$attemptsCount} tentativa(s) de usuários.");
        }

        $activity->delete();

        return redirect()->route('admin.activities.index')
            ->with('success', 'Atividade excluída com sucesso!');
    }
}