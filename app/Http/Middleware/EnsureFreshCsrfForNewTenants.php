<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureFreshCsrfForNewTenants
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
        // Check if this is a tenant domain (not central)
        $host = $request->getHost();
        $isTenantDomain = str_contains($host, '.saas-gamificacao.local') ||
                          (str_contains($host, '.') && !str_contains($host, '127.0.0.1'));

        // Only apply to tenant domains on POST requests
        if ($isTenantDomain && $request->isMethod('POST')) {
            // Check if this tenant session is new (first POST request)
            $sessionKey = 'tenant_csrf_initialized_' . $host;

            if (!$request->session()->has($sessionKey)) {
                // Regenerate token for new tenant session
                $request->session()->regenerateToken();
                $request->session()->put($sessionKey, true);

                // Log for debugging
                \Log::info('CSRF token regenerated for new tenant', [
                    'host' => $host,
                    'url' => $request->url(),
                    'user' => auth()->user()?->email
                ]);
            }
        }

        return $next($request);
    }
}