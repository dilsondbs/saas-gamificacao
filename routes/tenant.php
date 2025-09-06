<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Import existing routes from web.php for tenant context
    // (auth.php is already loaded in web.php, no need to duplicate)
    require base_path('routes/web.php');
    
    // Tenant-specific dashboard
    // NOTE: Commented to avoid conflict with central landing page
    // Route::get('/', function () {
    //     return redirect('/student/dashboard');
    // });
});
