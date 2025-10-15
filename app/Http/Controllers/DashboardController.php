<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\Point;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display the main dashboard
     */
    public function index()
    {
        $user = Auth::user();

        try {
            switch ($user->role) {
                case 'student':
                    return $this->studentDashboard($user);
                case 'instructor':
                    return $this->instructorDashboard($user);
                case 'admin':
                    return $this->adminDashboard($user);
                default:
                    return $this->guestDashboard($user);
            }
        } catch (\Exception $e) {
            Log::error('Dashboard error', [
                'user_id' => $user->id,
                'role' => $user->role,
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Dashboard', [
                'error' => 'Erro ao carregar dashboard. Tente novamente.',
            ]);
        }
    }

    /**
     * Student Dashboard with gamification
     */
    private function studentDashboard($user)
    {
        // Get user enrollments with progress
        $enrollments = CourseEnrollment::with(['course.activities', 'course.instructor'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Calculate overall progress
        $overallStats = $this->calculateOverallProgress($user, $enrollments);

        // Get user badges
        $userBadges = UserBadge::with('badge')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(6)
            ->get();

        // Get recent activities
        $recentActivities = UserActivity::with(['activity.course'])
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->latest('completed_at')
            ->limit(5)
            ->get();

        // Get next recommended activities
        $nextActivities = $this->getNextActivities($user, $enrollments);

        // Get leaderboard position
        $leaderboardData = $this->getLeaderboardData($user);

        // Get courses with progress
        $coursesWithProgress = $enrollments->map(function ($enrollment) use ($user) {
            $course = $enrollment->course;
            $progress = $this->calculateCourseProgress($user, $course);

            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'instructor' => $course->instructor->name ?? 'N/A',
                'enrolled_at' => $enrollment->enrolled_at,
                'progress' => $progress,
                'status' => $this->getCourseStatus($progress),
                'next_activity' => $this->getNextActivity($user, $course),
            ];
        });

        return Inertia::render('Dashboard', [
            'userType' => 'student',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
            ],
            'stats' => $overallStats,
            'courses' => $coursesWithProgress,
            'badges' => $userBadges,
            'recentActivities' => $recentActivities,
            'nextActivities' => $nextActivities,
            'leaderboard' => $leaderboardData,
        ]);
    }

    /**
     * Instructor Dashboard
     */
    private function instructorDashboard($user)
    {
        // Get instructor courses
        $courses = Course::where('instructor_id', $user->id)
            ->withCount(['enrollments', 'activities'])
            ->latest()
            ->limit(6)
            ->get();

        // Calculate instructor stats
        $stats = [
            'total_courses' => Course::where('instructor_id', $user->id)->count(),
            'total_students' => CourseEnrollment::whereHas('course', function($q) use ($user) {
                $q->where('instructor_id', $user->id);
            })->distinct('user_id')->count(),
            'total_activities' => Activity::whereHas('course', function($q) use ($user) {
                $q->where('instructor_id', $user->id);
            })->count(),
            'completion_rate' => $this->calculateInstructorCompletionRate($user),
        ];

        // Get recent student activities
        $recentStudentActivities = UserActivity::with(['user', 'activity.course'])
            ->whereHas('activity.course', function($q) use ($user) {
                $q->where('instructor_id', $user->id);
            })
            ->whereNotNull('completed_at')
            ->latest('completed_at')
            ->limit(8)
            ->get();

        return Inertia::render('Dashboard', [
            'userType' => 'instructor',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stats' => $stats,
            'courses' => $courses,
            'recentStudentActivities' => $recentStudentActivities,
        ]);
    }

    /**
     * Admin Dashboard
     */
    private function adminDashboard($user)
    {
        // Get platform-wide stats
        $stats = [
            'total_users' => User::count(),
            'total_courses' => Course::count(),
            'total_enrollments' => CourseEnrollment::count(),
            'total_activities' => Activity::count(),
        ];

        // Get recent activities across platform
        $recentActivities = UserActivity::with(['user', 'activity.course'])
            ->whereNotNull('completed_at')
            ->latest('completed_at')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard', [
            'userType' => 'admin',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Guest Dashboard
     */
    private function guestDashboard($user)
    {
        return Inertia::render('Dashboard', [
            'userType' => 'guest',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Calculate overall progress for student
     */
    private function calculateOverallProgress($user, $enrollments)
    {
        if ($enrollments->isEmpty()) {
            return [
                'total_points' => 0,
                'total_badges' => 0,
                'courses_enrolled' => 0,
                'courses_completed' => 0,
                'activities_completed' => 0,
                'completion_rate' => 0,
                'level' => 1,
                'points_to_next_level' => 100,
            ];
        }

        $totalPoints = Point::where('user_id', $user->id)->sum('points');
        $totalBadges = UserBadge::where('user_id', $user->id)->count();
        $activitiesCompleted = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        $coursesCompleted = $enrollments->filter(function ($enrollment) use ($user) {
            $progress = $this->calculateCourseProgress($user, $enrollment->course);
            return $progress['percentage'] >= 100;
        })->count();

        $overallCompletionRate = $enrollments->count() > 0
            ? ($coursesCompleted / $enrollments->count()) * 100
            : 0;

        $level = $this->calculateLevel($totalPoints);

        return [
            'total_points' => $totalPoints,
            'total_badges' => $totalBadges,
            'courses_enrolled' => $enrollments->count(),
            'courses_completed' => $coursesCompleted,
            'activities_completed' => $activitiesCompleted,
            'completion_rate' => round($overallCompletionRate, 1),
            'level' => $level['current'],
            'points_to_next_level' => $level['points_to_next'],
        ];
    }

    /**
     * Calculate progress for a specific course
     */
    private function calculateCourseProgress($user, $course)
    {
        $totalActivities = $course->activities()->count();

        if ($totalActivities === 0) {
            return [
                'percentage' => 0,
                'completed' => 0,
                'total' => 0,
            ];
        }

        $completedActivities = UserActivity::where('user_id', $user->id)
            ->whereIn('activity_id', $course->activities->pluck('id'))
            ->whereNotNull('completed_at')
            ->count();

        return [
            'percentage' => round(($completedActivities / $totalActivities) * 100, 1),
            'completed' => $completedActivities,
            'total' => $totalActivities,
        ];
    }

    /**
     * Get next recommended activities
     */
    private function getNextActivities($user, $enrollments)
    {
        $nextActivities = [];

        foreach ($enrollments as $enrollment) {
            $course = $enrollment->course;
            $nextActivity = $this->getNextActivity($user, $course);

            if ($nextActivity) {
                $nextActivities[] = [
                    'course_title' => $course->title,
                    'activity' => $nextActivity,
                ];
            }
        }

        return collect($nextActivities)->take(3);
    }

    /**
     * Get next activity for a course
     */
    private function getNextActivity($user, $course)
    {
        $completedActivityIds = UserActivity::where('user_id', $user->id)
            ->whereIn('activity_id', $course->activities->pluck('id'))
            ->whereNotNull('completed_at')
            ->pluck('activity_id');

        return $course->activities()
            ->whereNotIn('id', $completedActivityIds)
            ->orderBy('order')
            ->first();
    }

    /**
     * Get course status based on progress
     */
    private function getCourseStatus($progress)
    {
        if ($progress['percentage'] >= 100) {
            return 'completed';
        } elseif ($progress['percentage'] >= 70) {
            return 'almost_done';
        } elseif ($progress['percentage'] > 0) {
            return 'in_progress';
        } else {
            return 'not_started';
        }
    }

    /**
     * Calculate user level based on points
     */
    private function calculateLevel($points)
    {
        $levels = [
            1 => 0,
            2 => 100,
            3 => 250,
            4 => 500,
            5 => 1000,
            6 => 2000,
            7 => 3500,
            8 => 5500,
            9 => 8000,
            10 => 12000,
        ];

        $currentLevel = 1;
        $pointsToNext = 100;

        foreach ($levels as $level => $requiredPoints) {
            if ($points >= $requiredPoints) {
                $currentLevel = $level;
            } else {
                $pointsToNext = $requiredPoints - $points;
                break;
            }
        }

        return [
            'current' => $currentLevel,
            'points_to_next' => $pointsToNext,
        ];
    }

    /**
     * Get leaderboard data for user
     */
    private function getLeaderboardData($user)
    {
        $userPoints = Point::where('user_id', $user->id)->sum('points');

        $topUsers = DB::table('points')
            ->select('user_id', DB::raw('SUM(points) as total_points'))
            ->groupBy('user_id')
            ->orderBy('total_points', 'desc')
            ->limit(5)
            ->get();

        $userPosition = DB::table('points')
            ->select('user_id', DB::raw('SUM(points) as total_points'))
            ->groupBy('user_id')
            ->having('total_points', '>', $userPoints)
            ->count() + 1;

        return [
            'user_position' => $userPosition,
            'user_points' => $userPoints,
            'top_users' => $topUsers,
        ];
    }

    /**
     * Calculate instructor completion rate
     */
    private function calculateInstructorCompletionRate($user)
    {
        $totalEnrollments = CourseEnrollment::whereHas('course', function($q) use ($user) {
            $q->where('instructor_id', $user->id);
        })->count();

        if ($totalEnrollments === 0) {
            return 0;
        }

        $completedEnrollments = CourseEnrollment::whereHas('course', function($q) use ($user) {
            $q->where('instructor_id', $user->id);
        })->where('completed_at', '!=', null)->count();

        return round(($completedEnrollments / $totalEnrollments) * 100, 1);
    }
}