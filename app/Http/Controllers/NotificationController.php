<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
            'include_read' => 'nullable|boolean'
        ]);

        $user = Auth::user();
        $limit = $validated['limit'] ?? 20;
        $includeRead = $validated['include_read'] ?? true;

        $notifications = $this->notificationService->getUserNotifications($user, $limit);

        // Filter out read notifications if requested
        if (!$includeRead) {
            $notifications = array_filter($notifications, function($notification) {
                return !isset($notification['read']) || !$notification['read'];
            });
        }

        return response()->json([
            'notifications' => array_values($notifications),
            'total' => count($notifications),
            'unread_count' => count(array_filter($notifications, function($notification) {
                return !isset($notification['read']) || !$notification['read'];
            }))
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        $user = Auth::user();

        $success = $this->notificationService->markNotificationAsRead($user, $notificationId);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Notificação marcada como lida'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Erro ao marcar notificação como lida'
        ], 500);
    }

    /**
     * Clear all notifications
     */
    public function clearAll(): JsonResponse
    {
        $user = Auth::user();

        $success = $this->notificationService->clearUserNotifications($user);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Todas as notificações foram removidas'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Erro ao limpar notificações'
        ], 500);
    }

    /**
     * Send test notification (for development)
     */
    public function sendTestNotification(Request $request): JsonResponse
    {
        if (!config('app.debug')) {
            return response()->json(['error' => 'Not available in production'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|string|in:achievement,level_up,badge_earned,streak,encouragement',
            'message' => 'nullable|string|max:255'
        ]);

        $user = Auth::user();

        switch ($validated['type']) {
            case 'achievement':
                $this->notificationService->sendCustomNotification($user, [
                    'type' => 'achievement',
                    'title' => 'Teste de Conquista! 🎯',
                    'message' => $validated['message'] ?? 'Esta é uma notificação de teste!',
                    'icon' => 'trophy',
                    'color' => 'yellow'
                ]);
                break;

            case 'level_up':
                $this->notificationService->sendLevelUpNotification($user, $user->level ?? 1, ($user->level ?? 1) + 1);
                break;

            case 'streak':
                $this->notificationService->sendStreakMilestoneNotification($user, 7);
                break;

            case 'encouragement':
                $this->notificationService->sendEncouragementNotification($user, 'general');
                break;

            default:
                $this->notificationService->sendCustomNotification($user, [
                    'title' => 'Notificação de Teste',
                    'message' => $validated['message'] ?? 'Mensagem de teste'
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notificação de teste enviada'
        ]);
    }
}