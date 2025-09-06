<?php

use App\Http\Controllers\Api\LeaderboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API routes (accessible without authentication for testing)
Route::prefix('leaderboard')->group(function () {
    Route::get('/points', [LeaderboardController::class, 'points']);
    Route::get('/badges', [LeaderboardController::class, 'badges']);
    Route::get('/course/{course}', [LeaderboardController::class, 'courseLeaderboard']);
});

// Authenticated API routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Additional authenticated API endpoints will go here
});
