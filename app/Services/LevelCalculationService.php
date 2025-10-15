<?php

namespace App\Services;

use App\Models\User;
use App\Models\Point;
use Illuminate\Support\Facades\Cache;

class LevelCalculationService
{
    /**
     * Level calculation constants
     */
    const BASE_POINTS_PER_LEVEL = 100;
    const LEVEL_MULTIPLIER = 1.5;
    const MAX_LEVEL = 100;

    /**
     * Level titles and descriptions
     */
    const LEVEL_TITLES = [
        1 => ['title' => 'Iniciante', 'description' => 'Começando a jornada de aprendizagem'],
        5 => ['title' => 'Estudante', 'description' => 'Desenvolvendo hábitos de estudo'],
        10 => ['title' => 'Dedicado', 'description' => 'Mostrando consistência no aprendizado'],
        15 => ['title' => 'Persistente', 'description' => 'Superando desafios com determinação'],
        20 => ['title' => 'Conhecedor', 'description' => 'Acumulando conhecimento significativo'],
        25 => ['title' => 'Expert', 'description' => 'Demonstrando expertise em várias áreas'],
        30 => ['title' => 'Mentor', 'description' => 'Inspirando outros com seu conhecimento'],
        40 => ['title' => 'Guru', 'description' => 'Dominando múltiplas disciplinas'],
        50 => ['title' => 'Mestre', 'description' => 'Alcançando excelência no aprendizado'],
        75 => ['title' => 'Lenda', 'description' => 'Transcendendo limites do conhecimento'],
        100 => ['title' => 'Imortal', 'description' => 'Eternizado no hall da sabedoria']
    ];

    /**
     * Calculate user level based on total points
     */
    public function calculateUserLevel(User $user): int
    {
        $totalPoints = $user->total_points ?? 0;
        return $this->getPointsLevel($totalPoints);
    }

    /**
     * Get user's current level info
     */
    public function getUserLevel(User $user): array
    {
        $currentLevel = $this->calculateUserLevel($user);
        $totalPoints = $user->total_points ?? 0;

        $currentLevelPoints = $this->getPointsRequiredForLevel($currentLevel);
        $nextLevelPoints = $this->getPointsRequiredForLevel($currentLevel + 1);

        $pointsInCurrentLevel = $totalPoints - $currentLevelPoints;
        $pointsNeededForNextLevel = $nextLevelPoints - $totalPoints;
        $progressInCurrentLevel = $nextLevelPoints > $currentLevelPoints
            ? ($pointsInCurrentLevel / ($nextLevelPoints - $currentLevelPoints)) * 100
            : 100;

        return [
            'current_level' => $currentLevel,
            'total_points' => $totalPoints,
            'current_level_title' => $this->getLevelTitle($currentLevel),
            'current_level_description' => $this->getLevelDescription($currentLevel),
            'points_in_current_level' => $pointsInCurrentLevel,
            'points_needed_for_next_level' => max(0, $pointsNeededForNextLevel),
            'progress_in_current_level' => round($progressInCurrentLevel, 1),
            'next_level' => min(self::MAX_LEVEL, $currentLevel + 1),
            'next_level_title' => $this->getLevelTitle(min(self::MAX_LEVEL, $currentLevel + 1)),
            'is_max_level' => $currentLevel >= self::MAX_LEVEL
        ];
    }

    /**
     * Get points required for a specific level
     */
    public function getPointsRequiredForLevel(int $level): int
    {
        if ($level <= 1) {
            return 0;
        }

        // Use caching for expensive calculations
        return Cache::remember("level_points_{$level}", 3600, function() use ($level) {
            $totalPoints = 0;

            for ($i = 1; $i < $level; $i++) {
                $levelPoints = $this->getPointsForLevelUp($i);
                $totalPoints += $levelPoints;
            }

            return $totalPoints;
        });
    }

    /**
     * Get points needed to level up from a specific level
     */
    public function getPointsForLevelUp(int $fromLevel): int
    {
        // Progressive point requirements: each level requires more points
        $basePoints = self::BASE_POINTS_PER_LEVEL;
        $multiplier = pow(self::LEVEL_MULTIPLIER, ($fromLevel - 1) / 10);

        return (int) round($basePoints * $multiplier);
    }

    /**
     * Get level from total points
     */
    public function getPointsLevel(int $totalPoints): int
    {
        if ($totalPoints <= 0) {
            return 1;
        }

        // Use binary search for efficiency
        $low = 1;
        $high = self::MAX_LEVEL;

        while ($low < $high) {
            $mid = (int) (($low + $high) / 2);
            $pointsForMid = $this->getPointsRequiredForLevel($mid);

            if ($totalPoints >= $pointsForMid) {
                $low = $mid + 1;
            } else {
                $high = $mid;
            }
        }

        return max(1, $low - 1);
    }

    /**
     * Get level title
     */
    public function getLevelTitle(int $level): string
    {
        // Find the highest level title that applies
        $applicableLevel = 1;

        foreach (self::LEVEL_TITLES as $titleLevel => $data) {
            if ($level >= $titleLevel) {
                $applicableLevel = $titleLevel;
            } else {
                break;
            }
        }

        return self::LEVEL_TITLES[$applicableLevel]['title'] ?? 'Iniciante';
    }

    /**
     * Get level description
     */
    public function getLevelDescription(int $level): string
    {
        // Find the highest level description that applies
        $applicableLevel = 1;

        foreach (self::LEVEL_TITLES as $titleLevel => $data) {
            if ($level >= $titleLevel) {
                $applicableLevel = $titleLevel;
            } else {
                break;
            }
        }

        return self::LEVEL_TITLES[$applicableLevel]['description'] ?? 'Começando a jornada de aprendizagem';
    }

    /**
     * Get level progression statistics
     */
    public function getLevelProgressionStats(User $user): array
    {
        $userLevel = $this->getUserLevel($user);

        // Calculate estimated time to next level based on recent activity
        $recentPoints = Point::where('user_id', $user->id)
            ->where('type', 'earned')
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('points');

        $pointsPerDay = $recentPoints / 7;
        $daysToNextLevel = $pointsPerDay > 0
            ? ceil($userLevel['points_needed_for_next_level'] / $pointsPerDay)
            : null;

        // Get level-up history
        $levelHistory = $this->getUserLevelHistory($user);

        return [
            'current_level_info' => $userLevel,
            'points_per_day_average' => round($pointsPerDay, 2),
            'estimated_days_to_next_level' => $daysToNextLevel,
            'level_history' => $levelHistory,
            'total_levels_gained' => max(0, $userLevel['current_level'] - 1),
            'percentile_rank' => $this->getUserPercentileRank($user)
        ];
    }

    /**
     * Get user's level history
     */
    public function getUserLevelHistory(User $user): array
    {
        // This would ideally be stored in a separate table for level changes
        // For now, we'll calculate based on point history

        $pointHistory = Point::where('user_id', $user->id)
            ->where('type', 'earned')
            ->selectRaw('DATE(created_at) as date, SUM(points) as daily_points')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $levelHistory = [];
        $cumulativePoints = 0;
        $currentLevel = 1;

        foreach ($pointHistory as $day) {
            $cumulativePoints += $day->daily_points;
            $newLevel = $this->getPointsLevel($cumulativePoints);

            if ($newLevel > $currentLevel) {
                $levelHistory[] = [
                    'date' => $day->date,
                    'level' => $newLevel,
                    'points_at_level_up' => $cumulativePoints,
                    'level_title' => $this->getLevelTitle($newLevel)
                ];
                $currentLevel = $newLevel;
            }
        }

        return array_slice($levelHistory, -10); // Return last 10 level-ups
    }

    /**
     * Get user's percentile rank compared to all users
     */
    public function getUserPercentileRank(User $user): float
    {
        $userPoints = $user->total_points ?? 0;

        $usersWithLowerPoints = User::where('total_points', '<', $userPoints)
            ->where('total_points', '>', 0)
            ->count();

        $totalActiveUsers = User::where('total_points', '>', 0)->count();

        if ($totalActiveUsers === 0) {
            return 0;
        }

        return round(($usersWithLowerPoints / $totalActiveUsers) * 100, 1);
    }

    /**
     * Get leaderboard with level information
     */
    public function getLevelLeaderboard(int $limit = 10): array
    {
        $topUsers = User::where('total_points', '>', 0)
            ->orderByDesc('total_points')
            ->limit($limit)
            ->get();

        return $topUsers->map(function ($user, $index) {
            $levelInfo = $this->getUserLevel($user);

            return [
                'rank' => $index + 1,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'total_points' => $user->total_points,
                'level' => $levelInfo['current_level'],
                'level_title' => $levelInfo['current_level_title'],
                'level_description' => $levelInfo['current_level_description']
            ];
        })->toArray();
    }

    /**
     * Predict user's future level based on current progress
     */
    public function predictFutureLevel(User $user, int $daysInFuture): array
    {
        // Calculate recent points per day
        $recentPoints = Point::where('user_id', $user->id)
            ->where('type', 'earned')
            ->where('created_at', '>=', now()->subDays(14))
            ->sum('points');

        $pointsPerDay = $recentPoints / 14;
        $projectedPoints = ($user->total_points ?? 0) + ($pointsPerDay * $daysInFuture);
        $projectedLevel = $this->getPointsLevel((int) $projectedPoints);

        return [
            'current_level' => $user->level ?? 1,
            'current_points' => $user->total_points ?? 0,
            'points_per_day_average' => round($pointsPerDay, 2),
            'days_projected' => $daysInFuture,
            'projected_points' => (int) $projectedPoints,
            'projected_level' => $projectedLevel,
            'projected_level_title' => $this->getLevelTitle($projectedLevel),
            'levels_to_gain' => max(0, $projectedLevel - ($user->level ?? 1))
        ];
    }

    /**
     * Get level system overview
     */
    public function getLevelSystemOverview(): array
    {
        $levels = [];

        for ($level = 1; $level <= 20; $level++) {
            $levels[] = [
                'level' => $level,
                'title' => $this->getLevelTitle($level),
                'description' => $this->getLevelDescription($level),
                'points_required' => $this->getPointsRequiredForLevel($level),
                'points_for_next_level' => $this->getPointsForLevelUp($level)
            ];
        }

        return [
            'level_system' => $levels,
            'max_level' => self::MAX_LEVEL,
            'base_points_per_level' => self::BASE_POINTS_PER_LEVEL,
            'level_multiplier' => self::LEVEL_MULTIPLIER,
            'total_level_titles' => count(self::LEVEL_TITLES)
        ];
    }

    /**
     * Clear level calculation cache
     */
    public function clearLevelCache(): void
    {
        for ($level = 1; $level <= self::MAX_LEVEL; $level++) {
            Cache::forget("level_points_{$level}");
        }
    }

    /**
     * Recalculate and update user level
     */
    public function recalculateUserLevel(User $user): array
    {
        $newLevel = $this->calculateUserLevel($user);
        $oldLevel = $user->level ?? 1;

        if ($newLevel !== $oldLevel) {
            $user->update(['level' => $newLevel]);

            // Fire level change event if needed
            if ($newLevel > $oldLevel) {
                event(new \App\Events\LevelUp($user, $oldLevel, $newLevel, $user->total_points));
            }
        }

        return [
            'old_level' => $oldLevel,
            'new_level' => $newLevel,
            'level_changed' => $newLevel !== $oldLevel,
            'level_info' => $this->getUserLevel($user)
        ];
    }
}