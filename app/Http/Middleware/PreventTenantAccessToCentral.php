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
        $centralDomains = config('tenancy.central_domains');
        
        // If host is NOT in central domains, this is a tenant request
        if (!in_array($host, $centralDomains)) {
            abort(404);
        }

        return $next($request);
    }
}
