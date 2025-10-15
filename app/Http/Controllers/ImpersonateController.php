<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\User;

class ImpersonateController extends Controller
{
    /**
     * Handle impersonation login with token
     */
    public function loginWithToken($token)
    {
        // Get token data from cache (file cache)
        $tokenData = Cache::store('file')->get("impersonate_token_{$token}");

        if (!$tokenData) {
            return redirect('/login')
                ->withErrors(['error' => 'Token de impersonação inválido ou expirado.']);
        }

        // Find the user to impersonate (single database system)
        $user = User::where('id', $tokenData['user_id'])
                   ->where('tenant_id', $tokenData['tenant_id'])
                   ->first();
        if (!$user) {
            return redirect('/login')
                ->withErrors(['error' => 'Usuário não encontrado.']);
        }

        // Login as the user
        Auth::login($user);

        // Log impersonation for audit
        \Log::info('User impersonation successful', [
            'impersonated_user_id' => $user->id,
            'impersonated_user_email' => $user->email,
            'impersonated_user_role' => $user->role,
            'tenant_id' => $user->tenant_id,
            'token' => $token,
            'timestamp' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        // Clear the token (single use)
        Cache::store('file')->forget("impersonate_token_{$token}");

        // Redirect based on user role
        $redirectUrl = match($user->role) {
            'admin' => '/admin/dashboard',
            'instructor' => '/instructor/dashboard',
            'student' => '/student/dashboard',
            default => '/dashboard'
        };

        return redirect($redirectUrl)
            ->with('success', 'Login automático realizado como ' . $user->role . '!');
    }
}