<?php

namespace App\Services;

use App\Models\User;
use App\Models\Activity;
use App\Models\Course;
use App\Models\Badge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    /**
     * Notification types
     */
    const NOTIFICATION_TYPES = [
        'achievement' => 'Achievement Unlocked',
        'level_up' => 'Level Up',
        'badge_earned' => 'Badge Earned',
        'streak' => 'Streak Milestone',
        'course_completion' => 'Course Completed',
        'encouragement' => 'Encouragement',
        'milestone' => 'Milestone Reached'
    ];

    /**
     * Send activity completion notification
     */
    public function sendActivityCompletionNotification(User $user, Activity $activity, int $score): void
    {
        try {
            $notifications = $this->generateActivityCompletionNotifications($user, $activity, $score);

            foreach ($notifications as $notification) {
                $this->sendNotification($user, $notification);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send activity completion notification', [
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send badge earned notification
     */
    public function sendBadgeEarnedNotification(User $user, Badge $badge): void
    {
        try {
            $notification = [
                'type' => 'badge_earned',
                'title' => 'Nova Conquista Desbloqueada! 🏆',
                'message' => "Parabéns! Você conquistou a badge '{$badge->name}'!",
                'description' => $badge->description,
                'icon' => $badge->icon ?? 'trophy',
                'color' => $badge->color ?? 'gold',
                'points_awarded' => $badge->points_value ?? 0,
                'badge_data' => [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'color' => $badge->color
                ],
                'sound_effect' => 'achievement',
                'auto_dismiss' => false,
                'duration' => 8000 // 8 seconds
            ];

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send badge earned notification', [
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send level up notification
     */
    public function sendLevelUpNotification(User $user, int $oldLevel, int $newLevel): void
    {
        try {
            $levelService = app(LevelCalculationService::class);
            $levelTitle = $levelService->getLevelTitle($newLevel);

            $notification = [
                'type' => 'level_up',
                'title' => 'Subiu de Nível! ⭐',
                'message' => "Incrível! Você alcançou o nível {$newLevel}!",
                'description' => "Agora você é um {$levelTitle}! Continue assim!",
                'icon' => 'trending-up',
                'color' => 'blue',
                'level_data' => [
                    'old_level' => $oldLevel,
                    'new_level' => $newLevel,
                    'level_title' => $levelTitle,
                    'points_at_level_up' => $user->total_points
                ],
                'sound_effect' => 'level_up',
                'auto_dismiss' => false,
                'duration' => 10000, // 10 seconds
                'celebration' => true // Trigger celebration animation
            ];

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send level up notification', [
                'user_id' => $user->id,
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send streak milestone notification
     */
    public function sendStreakMilestoneNotification(User $user, int $streakDays): void
    {
        try {
            $milestoneMessage = $this->getStreakMilestoneMessage($streakDays);

            $notification = [
                'type' => 'streak',
                'title' => 'Sequência Incrível! 🔥',
                'message' => "Parabéns! {$streakDays} dias seguidos de estudo!",
                'description' => $milestoneMessage,
                'icon' => 'fire',
                'color' => 'orange',
                'streak_data' => [
                    'current_streak' => $streakDays,
                    'longest_streak' => $user->longest_streak ?? $streakDays
                ],
                'sound_effect' => 'streak',
                'auto_dismiss' => false,
                'duration' => 6000 // 6 seconds
            ];

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send streak milestone notification', [
                'user_id' => $user->id,
                'streak_days' => $streakDays,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send course completion notification
     */
    public function sendCourseCompletionNotification(User $user, Course $course): void
    {
        try {
            $notification = [
                'type' => 'course_completion',
                'title' => 'Curso Concluído! 🎓',
                'message' => "Parabéns! Você concluiu o curso '{$course->title}'!",
                'description' => 'Mais um marco na sua jornada de aprendizagem!',
                'icon' => 'academic-cap',
                'color' => 'green',
                'course_data' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'instructor' => $course->instructor->name ?? 'Instrutor'
                ],
                'sound_effect' => 'course_complete',
                'auto_dismiss' => false,
                'duration' => 8000, // 8 seconds
                'celebration' => true
            ];

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send course completion notification', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send encouragement notification
     */
    public function sendEncouragementNotification(User $user, string $context = 'general'): void
    {
        try {
            $encouragementMessage = $this->getEncouragementMessage($user, $context);

            $notification = [
                'type' => 'encouragement',
                'title' => 'Continue Assim! 💪',
                'message' => $encouragementMessage['message'],
                'description' => $encouragementMessage['description'],
                'icon' => $encouragementMessage['icon'],
                'color' => $encouragementMessage['color'],
                'sound_effect' => 'encouragement',
                'auto_dismiss' => true,
                'duration' => 5000 // 5 seconds
            ];

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send encouragement notification', [
                'user_id' => $user->id,
                'context' => $context,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send custom notification
     */
    public function sendCustomNotification(User $user, array $notificationData): void
    {
        try {
            $notification = array_merge([
                'type' => 'custom',
                'title' => 'Notificação',
                'message' => '',
                'icon' => 'bell',
                'color' => 'blue',
                'auto_dismiss' => true,
                'duration' => 5000
            ], $notificationData);

            $this->sendNotification($user, $notification);

        } catch (\Exception $e) {
            Log::error('Failed to send custom notification', [
                'user_id' => $user->id,
                'notification_data' => $notificationData,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate activity completion notifications
     */
    private function generateActivityCompletionNotifications(User $user, Activity $activity, int $score): array
    {
        $notifications = [];

        // Score-based notification
        if ($score >= 95) {
            $notifications[] = [
                'type' => 'achievement',
                'title' => 'Excelente! ⭐',
                'message' => "Nota perfeita na atividade '{$activity->title}'!",
                'description' => 'Você demonstrou domínio total do conteúdo!',
                'icon' => 'star',
                'color' => 'yellow',
                'score' => $score,
                'sound_effect' => 'perfect_score',
                'duration' => 6000
            ];
        } elseif ($score >= 85) {
            $notifications[] = [
                'type' => 'achievement',
                'title' => 'Ótimo Trabalho! 👏',
                'message' => "Excelente performance na atividade '{$activity->title}'!",
                'description' => "Nota: {$score}%. Continue assim!",
                'icon' => 'thumb-up',
                'color' => 'green',
                'score' => $score,
                'sound_effect' => 'good_score',
                'duration' => 5000
            ];
        } elseif ($score >= 70) {
            $notifications[] = [
                'type' => 'achievement',
                'title' => 'Parabéns! ✅',
                'message' => "Atividade '{$activity->title}' concluída com sucesso!",
                'description' => "Nota: {$score}%. Você pode avançar!",
                'icon' => 'check-circle',
                'color' => 'blue',
                'score' => $score,
                'sound_effect' => 'activity_complete',
                'duration' => 4000
            ];
        }

        return $notifications;
    }

    /**
     * Send notification to user
     */
    private function sendNotification(User $user, array $notification): void
    {
        // Add timestamp and ID
        $notification['id'] = uniqid('notif_');
        $notification['timestamp'] = now()->toISOString();
        $notification['user_id'] = $user->id;

        // Store notification for later retrieval
        $this->storeNotification($user, $notification);

        // Send real-time notification via broadcasting
        $this->broadcastNotification($user, $notification);

        // Send email notification if enabled
        $this->sendEmailNotification($user, $notification);

        Log::info('Notification sent', [
            'user_id' => $user->id,
            'notification_type' => $notification['type'],
            'notification_id' => $notification['id']
        ]);
    }

    /**
     * Store notification for user
     */
    private function storeNotification(User $user, array $notification): void
    {
        try {
            $cacheKey = "user_notifications_{$user->id}";
            $existingNotifications = Cache::get($cacheKey, []);

            // Add new notification to the beginning
            array_unshift($existingNotifications, $notification);

            // Keep only last 50 notifications
            $existingNotifications = array_slice($existingNotifications, 0, 50);

            // Store for 30 days
            Cache::put($cacheKey, $existingNotifications, now()->addDays(30));

        } catch (\Exception $e) {
            Log::error('Failed to store notification', [
                'user_id' => $user->id,
                'notification_id' => $notification['id'],
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Broadcast notification via WebSocket
     */
    private function broadcastNotification(User $user, array $notification): void
    {
        try {
            // This would integrate with Laravel Broadcasting
            broadcast(new \App\Events\NotificationSent($user, $notification))
                ->toOthers();

        } catch (\Exception $e) {
            Log::error('Failed to broadcast notification', [
                'user_id' => $user->id,
                'notification_id' => $notification['id'],
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send email notification if user preferences allow
     */
    private function sendEmailNotification(User $user, array $notification): void
    {
        try {
            // Check user email preferences
            $emailEnabled = $user->email_notifications ?? true;
            $importantTypes = ['level_up', 'badge_earned', 'course_completion'];

            if ($emailEnabled && in_array($notification['type'], $importantTypes)) {
                // This would queue an email job
                // Mail::to($user->email)->queue(new AchievementNotificationMail($notification));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'user_id' => $user->id,
                'notification_id' => $notification['id'],
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get streak milestone message
     */
    private function getStreakMilestoneMessage(int $streakDays): string
    {
        if ($streakDays >= 30) {
            return "Um mês inteiro de dedicação! Você é uma máquina de aprender! 🚀";
        } elseif ($streakDays >= 21) {
            return "Três semanas seguidas! Seu comprometimento é inspirador! 🌟";
        } elseif ($streakDays >= 14) {
            return "Duas semanas de consistência! Você está criando um hábito poderoso! 💪";
        } elseif ($streakDays >= 7) {
            return "Uma semana completa! A consistência é a chave do sucesso! 🔑";
        } elseif ($streakDays >= 3) {
            return "Três dias seguidos! Continue mantendo o ritmo! 🎯";
        } else {
            return "Que bom te ver aqui novamente! 😊";
        }
    }

    /**
     * Get encouragement message based on user context
     */
    private function getEncouragementMessage(User $user, string $context): array
    {
        $messages = [
            'general' => [
                'message' => 'Que tal uma nova atividade hoje?',
                'description' => 'Cada pequeno passo conta na sua jornada de aprendizagem!',
                'icon' => 'academic-cap',
                'color' => 'blue'
            ],
            'low_activity' => [
                'message' => 'Sentimos sua falta!',
                'description' => 'Volte quando puder - seu progresso está esperando!',
                'icon' => 'heart',
                'color' => 'pink'
            ],
            'stuck' => [
                'message' => 'Não desista!',
                'description' => 'Revise o material e tente novamente. Você consegue!',
                'icon' => 'light-bulb',
                'color' => 'yellow'
            ],
            'progress' => [
                'message' => 'Você está indo muito bem!',
                'description' => 'Seu progresso é notável. Continue assim!',
                'icon' => 'trending-up',
                'color' => 'green'
            ]
        ];

        return $messages[$context] ?? $messages['general'];
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(User $user, int $limit = 20): array
    {
        $cacheKey = "user_notifications_{$user->id}";
        $notifications = Cache::get($cacheKey, []);

        return array_slice($notifications, 0, $limit);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(User $user, string $notificationId): bool
    {
        try {
            $cacheKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($cacheKey, []);

            foreach ($notifications as &$notification) {
                if ($notification['id'] === $notificationId) {
                    $notification['read'] = true;
                    $notification['read_at'] = now()->toISOString();
                    break;
                }
            }

            Cache::put($cacheKey, $notifications, now()->addDays(30));

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read', [
                'user_id' => $user->id,
                'notification_id' => $notificationId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Clear all user notifications
     */
    public function clearUserNotifications(User $user): bool
    {
        try {
            $cacheKey = "user_notifications_{$user->id}";
            Cache::forget($cacheKey);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to clear user notifications', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}