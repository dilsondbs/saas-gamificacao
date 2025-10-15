<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            if (Auth::user()->role !== 'admin') {
                abort(403, 'Acesso negado. Apenas administradores podem acessar esta área.');
            }
            return $next($request);
        });
    }

    /**
     * Display the admin dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get basic statistics with fallbacks
        $stats = $this->getPlatformStats();

        return Inertia::render('Admin/Dashboard', [
            'user' => $user,
            'generalStats' => [
                'totalUsers' => $stats['total_users'] ?? 0,
                'totalStudents' => User::where('role', 'student')->count(),
                'totalInstructors' => User::where('role', 'instructor')->count(),
                'totalCourses' => $stats['total_courses'] ?? 0,
                'publishedCourses' => Course::where('status', 'published')->count(),
                'totalActivities' => 0, // Will be implemented later
                'totalBadges' => 0, // Will be implemented later
            ],
            'engagementMetrics' => [
                'activeUsersToday' => 0,
                'enrollmentsToday' => 0,
                'activitiesCompletedToday' => 0,
                'activeUsersThisWeek' => 0,
                'enrollmentsThisWeek' => 0,
                'activitiesCompletedThisWeek' => 0,
                'enrollmentsThisMonth' => 0,
                'pointsAwardedThisMonth' => 0,
                'badgesEarnedThisMonth' => 0,
            ],
            'topUsers' => [],
            'topCourses' => [],
            'chartData' => [
                'userGrowth' => [],
                'enrollmentGrowth' => [],
                'activityCompletion' => [],
                'pointsGrowth' => [],
                'userRoleDistribution' => [],
                'courseStatusDistribution' => [],
                'badgeDistribution' => [],
            ],
        ]);
    }

    /**
     * Get platform statistics
     */
    private function getPlatformStats(): array
    {
        try {
            $totalUsers = User::count();
            $totalCourses = Course::count();

            return [
                'total_users' => $totalUsers,
                'total_courses' => $totalCourses,
            ];
        } catch (\Exception $e) {
            return [
                'total_users' => 0,
                'total_courses' => 0,
            ];
        }
    }


    /**
     * Get API data for dashboard widgets
     */
    public function getStats(Request $request): JsonResponse
    {
        return response()->json($this->getPlatformStats());
    }
}