<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckTemporaryPassword
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        \Log::info('🔐 CheckTemporaryPassword middleware executado', [
            'route' => $request->route() ? $request->route()->getName() : 'no-route',
            'url' => $request->url(),
            'authenticated' => $request->user() ? 'yes' : 'no'
        ]);

        // Check if user is authenticated
        if ($request->user()) {
            $user = $request->user();

            \Log::info('🔐 Usuário autenticado', [
                'email' => $user->email,
                'password_is_temporary' => $user->password_is_temporary,
                'mustChangePassword' => $user->mustChangePassword()
            ]);

            // Check if user has temporary password
            if ($user->mustChangePassword()) {
                // Allow access to password change routes
                $allowedRoutes = [
                    'password.change',
                    'password.change.update',
                    'password.update',
                    'logout',
                    'profile.edit',
                    'profile.update'
                ];

                $currentRoute = $request->route() ? $request->route()->getName() : null;

                \Log::info('🔐 Senha temporária detectada!', [
                    'current_route' => $currentRoute,
                    'allowed_routes' => $allowedRoutes,
                    'should_redirect' => !in_array($currentRoute, $allowedRoutes)
                ]);

                if (!in_array($currentRoute, $allowedRoutes)) {
                    \Log::info('🔐 REDIRECIONANDO para password.change');
                    return redirect()->route('password.change')
                        ->with('warning', 'Você deve alterar sua senha temporária antes de continuar.');
                }
            }
        }

        return $next($request);
    }
}
