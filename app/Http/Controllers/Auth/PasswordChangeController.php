<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    /**
     * Show the password change form for temporary passwords.
     */
    public function show(Request $request)
    {
        return Inertia::render('Auth/ChangePassword', [
            'must_change' => $request->user()->mustChangePassword(),
        ]);
    }

    /**
     * Handle the password change request.
     */
    public function update(Request $request)
    {
        \Log::info('🔐 Iniciando atualização de senha', [
            'user' => $request->user()->email,
            'has_current_password' => $request->has('current_password'),
            'has_new_password' => $request->has('password')
        ]);

        $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) use ($request) {
                if (!Hash::check($value, $request->user()->password)) {
                    $fail('A senha atual está incorreta.');
                }
            }],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        \Log::info('🔐 Validação passou, atualizando senha');

        // Update password and mark as no longer temporary
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Mark password as changed (no longer temporary)
        $user->markPasswordAsChanged();

        \Log::info('🔐 Senha atualizada com sucesso', [
            'user' => $user->email,
            'password_is_temporary' => $user->password_is_temporary
        ]);

        // Redirect based on user role
        $dashboardRoute = $this->getDashboardRoute($user);

        return redirect($dashboardRoute)->with('success', 'Senha alterada com sucesso!');
    }

    /**
     * Get dashboard route based on user role
     */
    private function getDashboardRoute($user): string
    {
        // Central user (no tenant_id)
        if (!$user->tenant_id) {
            return '/central/dashboard';
        }

        // Tenant users
        switch ($user->role) {
            case 'admin':
                return '/admin/dashboard';
            case 'instructor':
                return '/instructor/dashboard';
            case 'student':
                return '/student/dashboard';
            default:
                return '/dashboard';
        }
    }
}
