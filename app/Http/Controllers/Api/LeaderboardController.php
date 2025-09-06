<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Badge;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function points()
    {
        $leaderboard = User::where('role', 'student')
                          ->orderByDesc('total_points')
                          ->take(50)
                          ->get(['id', 'name', 'total_points']);

        return response()->json([
            'data' => $leaderboard,
            'message' => 'Points leaderboard retrieved successfully'
        ]);
    }

    public function badges()
    {
        $users = User::where('role', 'student')
                    ->withCount('badges')
                    ->orderByDesc('badges_count')
                    ->take(50)
                    ->with(['badges' => function($query) {
                        $query->select(['badges.id', 'name', 'icon', 'color']);
                    }])
                    ->get(['id', 'name']);

        return response()->json([
            'data' => $users,
            'message' => 'Badges leaderboard retrieved successfully'
        ]);
    }

    public function courseLeaderboard($courseId)
    {
        $leaderboard = User::whereHas('enrolledCourses', function($query) use ($courseId) {
                              $query->where('course_id', $courseId);
                          })
                          ->withPivot(['progress_percentage', 'completed_at'])
                          ->orderByDesc('course_enrollments.progress_percentage')
                          ->orderBy('course_enrollments.completed_at')
                          ->take(20)
                          ->get(['id', 'name', 'total_points']);

        return response()->json([
            'data' => $leaderboard,
            'message' => 'Course leaderboard retrieved successfully'
        ]);
    }
}
