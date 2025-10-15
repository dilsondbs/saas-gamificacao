<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Badge;
use App\Models\Point;
use App\Models\Activity;
use App\Models\CourseEnrollment;
use App\Models\UserActivity;
use App\Models\UserBadge;
use App\Services\TenantContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // CORREÇÃO CRÍTICA: Verificar contexto de tenant
        $tenantContextService = app(TenantContextService::class);

        try {
            return Inertia::render('Admin/DashboardFixed', [
                'generalStats' => $this->getGeneralStats(),
                'engagementMetrics' => $this->getEngagementMetrics(),
                'topUsers' => $this->getTopUsers(),
                'topCourses' => $this->getTopCourses(),
                'chartData' => $this->getChartData(),
                'tenantInfo' => [
                    'tenant_id' => $tenantContextService->getCurrentTenantId(),
                    'is_central' => $tenantContextService->isCentralContext(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin Dashboard Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    private function getGeneralStats()
    {
        // CORREÇÃO CRÍTICA: Queries agora respeitam automaticamente o tenant_id via global scope
        // Os models com BelongsToTenant trait filtrarão automaticamente por tenant
        return [
            'totalUsers' => User::count(),
            'totalStudents' => User::where('role', 'student')->count(),
            'totalInstructors' => User::where('role', 'instructor')->count(),
            'totalAdmins' => User::where('role', 'admin')->count(),
            'totalCourses' => Course::count(),
            'publishedCourses' => Course::where('status', 'published')->count(),
            'draftCourses' => Course::where('status', 'draft')->count(),
            'totalActivities' => Activity::count(),
            'totalBadges' => Badge::count(),
            'activeBadges' => Badge::where('is_active', true)->count(),
            'totalEnrollments' => CourseEnrollment::count(),
            'completedCourses' => CourseEnrollment::whereNotNull('completed_at')->count(),
            'totalPointsAwarded' => Point::where('type', 'earned')->sum('points'),
            'totalBadgesEarned' => UserBadge::count(),
        ];
    }

    private function getEngagementMetrics()
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'activeUsersToday' => User::whereDate('updated_at', $today)->count(),
            'activeUsersThisWeek' => User::where('updated_at', '>=', $thisWeek)->count(),
            'enrollmentsToday' => CourseEnrollment::whereDate('created_at', $today)->count(),
            'enrollmentsThisWeek' => CourseEnrollment::where('created_at', '>=', $thisWeek)->count(),
            'enrollmentsThisMonth' => CourseEnrollment::where('created_at', '>=', $thisMonth)->count(),
            'activitiesCompletedToday' => UserActivity::whereNotNull('completed_at')
                ->whereDate('completed_at', $today)->count(),
            'activitiesCompletedThisWeek' => UserActivity::whereNotNull('completed_at')
                ->where('completed_at', '>=', $thisWeek)->count(),
            'activitiesCompletedThisMonth' => UserActivity::whereNotNull('completed_at')
                ->where('completed_at', '>=', $thisMonth)->count(),
            'pointsAwardedToday' => Point::where('type', 'earned')
                ->whereDate('created_at', $today)->sum('points'),
            'pointsAwardedThisWeek' => Point::where('type', 'earned')
                ->where('created_at', '>=', $thisWeek)->sum('points'),
            'pointsAwardedThisMonth' => Point::where('type', 'earned')
                ->where('created_at', '>=', $thisMonth)->sum('points'),
            'badgesEarnedToday' => UserBadge::whereDate('earned_at', $today)->count(),
            'badgesEarnedThisWeek' => UserBadge::where('earned_at', '>=', $thisWeek)->count(),
            'badgesEarnedThisMonth' => UserBadge::where('earned_at', '>=', $thisMonth)->count(),
        ];
    }

    private function getTopUsers()
    {
        return User::where('role', 'student')
            ->orderBy('total_points', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'total_points', 'created_at'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_points' => $user->total_points,
                    'badges_count' => UserBadge::where('user_id', $user->id)->count(),
                    'enrollments_count' => CourseEnrollment::where('user_id', $user->id)->count(),
                    'activities_completed' => UserActivity::where('user_id', $user->id)
                        ->whereNotNull('completed_at')->count(),
                    'member_since' => $user->created_at->format('M Y'),
                ];
            });
    }

    private function getTopCourses()
    {
        return Course::withCount(['enrollments', 'activities'])
            ->with(['instructor' => function($query) {
                $query->select('id', 'name');
            }])
            ->orderBy('enrollments_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($course) {
                $completionRate = $course->enrollments_count > 0 
                    ? CourseEnrollment::where('course_id', $course->id)
                        ->whereNotNull('completed_at')
                        ->count() / $course->enrollments_count * 100
                    : 0;

                $avgProgress = CourseEnrollment::where('course_id', $course->id)
                    ->avg('progress_percentage') ?? 0;

                $totalPointsEarned = Point::where('source_type', Course::class)
                    ->where('source_id', $course->id)
                    ->where('type', 'earned')
                    ->sum('points');

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'instructor_name' => $course->instructor->name ?? 'N/A',
                    'enrollments_count' => $course->enrollments_count,
                    'activities_count' => $course->activities_count,
                    'completion_rate' => round($completionRate, 1),
                    'avg_progress' => round($avgProgress, 1),
                    'total_points_earned' => $totalPointsEarned,
                    'status' => $course->status,
                    'created_at' => $course->created_at->format('M d, Y'),
                ];
            });
    }

    private function getChartData()
    {
        return [
            'userGrowth' => $this->getUserGrowthData(),
            'enrollmentGrowth' => $this->getEnrollmentGrowthData(),
            'pointsGrowth' => $this->getPointsGrowthData(),
            'activityCompletion' => $this->getActivityCompletionData(),
            'courseStatusDistribution' => $this->getCourseStatusDistribution(),
            'userRoleDistribution' => $this->getUserRoleDistribution(),
            'badgeDistribution' => $this->getBadgeDistribution(),
        ];
    }

    private function getUserGrowthData()
    {
        $last30Days = collect();
        
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = User::whereDate('created_at', '<=', $date)->count();
            
            $last30Days->push([
                'date' => $date->format('M d'),
                'total_users' => $count,
                'students' => User::where('role', 'student')->whereDate('created_at', '<=', $date)->count(),
                'instructors' => User::where('role', 'instructor')->whereDate('created_at', '<=', $date)->count(),
            ]);
        }

        return $last30Days;
    }

    private function getEnrollmentGrowthData()
    {
        $last30Days = collect();
        
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyEnrollments = CourseEnrollment::whereDate('created_at', $date)->count();
            $totalEnrollments = CourseEnrollment::whereDate('created_at', '<=', $date)->count();
            
            $last30Days->push([
                'date' => $date->format('M d'),
                'daily_enrollments' => $dailyEnrollments,
                'total_enrollments' => $totalEnrollments,
            ]);
        }

        return $last30Days;
    }

    private function getPointsGrowthData()
    {
        $last30Days = collect();
        
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyPoints = Point::where('type', 'earned')->whereDate('created_at', $date)->sum('points');
            $totalPoints = Point::where('type', 'earned')->whereDate('created_at', '<=', $date)->sum('points');
            
            $last30Days->push([
                'date' => $date->format('M d'),
                'daily_points' => $dailyPoints,
                'total_points' => $totalPoints,
            ]);
        }

        return $last30Days;
    }

    private function getActivityCompletionData()
    {
        $last7Days = collect();
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $completed = UserActivity::whereNotNull('completed_at')
                ->whereDate('completed_at', $date)->count();
            $started = UserActivity::whereDate('started_at', $date)->count();
            
            $last7Days->push([
                'date' => $date->format('D'),
                'completed' => $completed,
                'started' => $started,
            ]);
        }

        return $last7Days;
    }

    private function getCourseStatusDistribution()
    {
        return Course::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                    'percentage' => round(($item->count / Course::count()) * 100, 1)
                ];
            });
    }

    private function getUserRoleDistribution()
    {
        return User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(function ($item) {
                return [
                    'role' => ucfirst($item->role),
                    'count' => $item->count,
                    'percentage' => round(($item->count / User::count()) * 100, 1)
                ];
            });
    }

    private function getBadgeDistribution()
    {
        $badgeStats = Badge::withCount('users')
            ->orderBy('users_count', 'desc')
            ->get()
            ->map(function ($badge) {
                return [
                    'name' => $badge->name,
                    'earned_count' => $badge->users_count,
                    'color' => $badge->color ?? '#6B7280',
                ];
            });

        return $badgeStats;
    }
}
