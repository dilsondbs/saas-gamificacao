<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure we are in central context for password confirmation tests
        $this->ensureCentralContext();
    }

    public function test_confirm_password_screen_can_be_rendered(): void
    {
        // Create user in central context
        $this->ensureCentralContext();
        $user = User::factory()->create();

        $response = $this->withoutTenancyMiddleware()->actingAs($user)->get('/confirm-password');

        $response->assertStatus(200);
    }

    public function test_password_can_be_confirmed(): void
    {
        // Create user in central context
        $this->ensureCentralContext();
        $user = User::factory()->create();

        $response = $this->withoutTenancyMiddleware()->actingAs($user)->post('/confirm-password', [
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_password_is_not_confirmed_with_invalid_password(): void
    {
        // Create user in central context
        $this->ensureCentralContext();
        $user = User::factory()->create();

        $response = $this->withoutTenancyMiddleware()->actingAs($user)->post('/confirm-password', [
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors();
    }
}
