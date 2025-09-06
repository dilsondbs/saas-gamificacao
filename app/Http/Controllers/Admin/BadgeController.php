<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function index(Request $request)
    {
        $query = Badge::withCount('users');

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $badges = $query->paginate(15)
            ->withQueryString()
            ->through(function ($badge) {
                return [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'color' => $badge->color,
                    'type' => $badge->type,
                    'criteria' => $badge->criteria,
                    'points_value' => $badge->points_value,
                    'is_active' => $badge->is_active,
                    'users_count' => $badge->users_count,
                    'created_at' => $badge->created_at,
                ];
            });

        $stats = [
            'total' => Badge::count(),
            'active' => Badge::where('is_active', true)->count(),
            'inactive' => Badge::where('is_active', false)->count(),
            'total_earned' => UserBadge::count(),
        ];

        return Inertia::render('Admin/Badges/Index', [
            'badges' => $badges,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'status', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Badges/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'color' => 'required|string|max:7',
            'type' => 'required|in:completion,points,streak,special',
            'criteria' => 'required|array',
            'points_value' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        Badge::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => '🏅', // Default icon
            'color' => $request->color,
            'type' => $request->type,
            'criteria' => $request->criteria,
            'points_value' => $request->points_value,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.badges.index')
            ->with('success', 'Badge criado com sucesso!');
    }

    public function show(Badge $badge)
    {
        $badge->loadCount('users');

        $stats = [
            'users_count' => $badge->users_count,
            'earned_today' => UserBadge::where('badge_id', $badge->id)
                ->whereDate('earned_at', today())
                ->count(),
            'earned_this_week' => UserBadge::where('badge_id', $badge->id)
                ->where('earned_at', '>=', now()->startOfWeek())
                ->count(),
            'earned_this_month' => UserBadge::where('badge_id', $badge->id)
                ->where('earned_at', '>=', now()->startOfMonth())
                ->count(),
        ];

        $recentEarners = UserBadge::where('badge_id', $badge->id)
            ->with('user')
            ->orderBy('earned_at', 'desc')
            ->take(15)
            ->get();

        return Inertia::render('Admin/Badges/Show', [
            'badge' => $badge,
            'stats' => $stats,
            'recentEarners' => $recentEarners,
        ]);
    }

    public function edit(Badge $badge)
    {
        return Inertia::render('Admin/Badges/Edit', [
            'badge' => $badge,
        ]);
    }

    public function update(Request $request, Badge $badge)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'color' => 'required|string|max:7',
            'type' => 'required|in:completion,points,streak,special',
            'criteria' => 'required|array',
            'points_value' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $badge->update([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $badge->icon ?? '🏅', // Keep existing or use default
            'color' => $request->color,
            'type' => $request->type,
            'criteria' => $request->criteria,
            'points_value' => $request->points_value,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.badges.index')
            ->with('success', 'Badge atualizado com sucesso!');
    }

    public function destroy(Badge $badge)
    {
        // Check if badge has been earned by users
        $earnedCount = $badge->users()->count();
        
        if ($earnedCount > 0) {
            return redirect()->route('admin.badges.index')
                ->with('error', "Não é possível excluir o badge pois ele foi conquistado por {$earnedCount} usuário(s).");
        }

        $badge->delete();

        return redirect()->route('admin.badges.index')
            ->with('success', 'Badge excluído com sucesso!');
    }
}