<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_valid_registration_creates_user_and_returns_201_without_accepting_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secure-password',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'user')
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
        $this->assertDatabaseHas(User::class, [
            'email' => 'test@example.com',
            'role' => 'user',
        ]);
    }

    public function test_registration_returns_422_for_short_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertDatabaseMissing(User::class, ['email' => 'test@example.com']);
    }

    public function test_valid_credentials_return_user_and_token(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'secure-password',
        ]);

        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'secure-password',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_invalid_credentials_return_401(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized()->assertJsonPath('message', 'E-poçt və ya şifrə yanlışdır.');
    }

    public function test_repeated_login_attempts_return_429(): void
    {
        User::factory()->create(['email' => 'limited@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/login', [
                'email' => 'limited@example.com',
                'password' => 'wrong-password',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/login', [
            'email' => 'limited@example.com',
            'password' => 'wrong-password',
        ])->assertTooManyRequests();
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
