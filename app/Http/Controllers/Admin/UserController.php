<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CourseEnrollment;
use App\Models\UserBadge;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(15)
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'total_points' => $user->total_points,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'enrollments_count' => CourseEnrollment::where('user_id', $user->id)->count(),
                    'badges_count' => UserBadge::where('user_id', $user->id)->count(),
                    'activities_completed' => UserActivity::where('user_id', $user->id)
                        ->whereNotNull('completed_at')->count(),
                ];
            });

        $stats = [
            'total' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'instructors' => User::where('role', 'instructor')->count(),
            'admins' => User::where('role', 'admin')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:admin,instructor,student',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'total_points' => 0,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário criado com sucesso!');
    }

    public function show(User $user)
    {
        $user->load(['enrollments.course', 'badges.badge', 'activities.activity']);

        $stats = [
            'enrollments_count' => $user->enrollments->count(),
            'completed_courses' => $user->enrollments->whereNotNull('completed_at')->count(),
            'badges_count' => $user->badges->count(),
            'activities_completed' => $user->activities->whereNotNull('completed_at')->count(),
            'total_points' => $user->total_points ?? 0,
        ];

        $recentActivities = $user->activities()
            ->with('activity')
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'total_points']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,instructor,student',
            'total_points' => 'nullable|integer|min:0',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'total_points' => $request->role === 'student' ? ($request->total_points ?? 0) : null,
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário atualizado com sucesso!');
    }

    public function destroy(User $user)
    {
        // Prevent deleting the current user
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Você não pode excluir sua própria conta!');
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Não é possível excluir o último administrador!');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário excluído com sucesso!');
    }
}