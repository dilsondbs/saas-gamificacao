<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PreventTenantAccessToCentral
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
        // Check if this is a tenant domain request
        $host = $request->getHost();
        $centralDomains = config('tenancy.central_domains', ['127.0.0.1', 'localhost', 'saas-gamificacao.local']);

        \Log::info('PreventTenantAccessToCentral middleware', [
            'host' => $host,
            'central_domains' => $centralDomains,
            'is_central' => in_array($host, $centralDomains),
            'url' => $request->url()
        ]);

        // If host is NOT in central domains, this is a tenant request
        if (!in_array($host, $centralDomains)) {
            \Log::warning('Blocking non-central request', ['host' => $host, 'url' => $request->url()]);
            abort(404, 'Acesso negado: Este domínio não pode acessar recursos centrais.');
        }

        return $next($request);
    }
}
