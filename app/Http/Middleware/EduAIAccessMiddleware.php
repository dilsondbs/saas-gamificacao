<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EduAIAccessMiddleware
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
        if (!in_array(auth()->user()->role ?? 'student', ['admin', 'instructor'])) {
            abort(403, 'Acesso negado. Apenas administradores e instrutores podem usar o EduAI.');
        }

        return $next($request);
    }
}
