<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TodoControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_todo_routes_return_401_without_authentication(): void
    {
        $this->getJson('/api/todos')->assertUnauthorized();
    }

    public function test_valid_payload_creates_todo_and_returns_201(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/todos', ['title' => 'Private task'])
            ->assertCreated()
            ->assertJsonPath('title', 'Private task');
        $this->assertDatabaseHas(Todo::class, [
            'user_id' => $user->id,
            'title' => 'Private task',
        ]);
    }

    public function test_owner_can_update_todo(): void
    {
        $owner = User::factory()->create();
        $todo = $owner->todos()->create(['title' => 'Owner task']);

        $this->actingAs($owner)
            ->patchJson("/api/todos/{$todo->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonPath('completed', true);
        $this->assertDatabaseHas(Todo::class, ['id' => $todo->id, 'completed' => true]);
    }

    public function test_other_users_todo_returns_404(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $todo = $owner->todos()->create(['title' => 'Owner task']);

        $this->actingAs($other)->getJson("/api/todos/{$todo->id}")->assertNotFound();
        $this->actingAs($other)->deleteJson("/api/todos/{$todo->id}")->assertNotFound();
        $this->assertModelExists($todo);
    }
}
