<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InjectTenantData
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
        // Only inject tenant data if we're in tenant context
        if (tenancy()->initialized) {
            $tenant = tenant();
            $settings = json_decode($tenant->settings, true) ?? [];
            
            // Calculate usage stats
            $userCount = \App\Models\User::count();
            $courseCount = \App\Models\Course::count();
            $storageUsed = $tenant->getStorageUsedMb();
            
            // Inject tenant data into all Inertia responses
            Inertia::share([
                'tenant' => [
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'plan' => $tenant->plan,
                    'primary_color' => $settings['primary_color'] ?? '#3B82F6',
                    'logo_url' => $settings['logo_url'] ?? null,
                    'industry' => $settings['industry'] ?? null,
                    'limits' => [
                        'users' => [
                            'max' => $tenant->max_users,
                            'current' => $userCount,
                            'remaining' => max(0, $tenant->max_users - $userCount),
                            'percentage' => round(($userCount / $tenant->max_users) * 100, 1)
                        ],
                        'courses' => [
                            'max' => $tenant->max_courses,
                            'current' => $courseCount,
                            'remaining' => max(0, $tenant->max_courses - $courseCount),
                            'percentage' => round(($courseCount / $tenant->max_courses) * 100, 1)
                        ],
                        'storage' => [
                            'max_mb' => $tenant->max_storage_mb,
                            'current_mb' => $storageUsed,
                            'remaining_mb' => max(0, $tenant->max_storage_mb - $storageUsed),
                            'percentage' => round(($storageUsed / $tenant->max_storage_mb) * 100, 1)
                        ]
                    ],
                    'status' => [
                        'is_active' => $tenant->is_active,
                        'trial_ends_at' => $tenant->trial_ends_at,
                        'is_trial_active' => $tenant->isTrialActive()
                    ]
                ]
            ]);
        }

        return $next($request);
    }
}
