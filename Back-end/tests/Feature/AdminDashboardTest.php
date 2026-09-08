<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_dashboard_api(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_receives_dashboard_statistics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $user->todos()->createMany([
            ['title' => 'Tamamlanan task', 'completed' => true],
            ['title' => 'Aktiv task', 'completed' => false],
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/dashboard?days=7')
            ->assertOk()
            ->assertJsonPath('total_users', 2)
            ->assertJsonPath('total_tasks', 2)
            ->assertJsonPath('completed_tasks', 1)
            ->assertJsonPath('active_tasks', 1)
            ->assertJsonCount(7, 'activity')
            ->assertJsonCount(2, 'recent_tasks');
    }

    public function test_admin_can_filter_and_paginate_tasks(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $user->todos()->create(['title' => 'Axtarılan task', 'completed' => true]);
        $user->todos()->create(['title' => 'Başqa task', 'completed' => false]);

        $this->actingAs($admin)
            ->getJson('/api/admin/tasks?search=Axtarılan&status=completed&per_page=10')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.title', 'Axtarılan task');
    }

    public function test_admin_can_list_users_with_task_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $user->todos()->create(['title' => 'Task', 'completed' => true]);

        $this->actingAs($admin)
            ->getJson('/api/admin/users?per_page=10')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonFragment([
                'email' => $user->email,
                'todos_count' => 1,
                'completed_todos_count' => 1,
            ]);
    }

    public function test_admin_can_export_tasks_as_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $user->todos()->create(['title' => 'CSV task', 'completed' => false]);

        $this->actingAs($admin)
            ->get('/api/admin/reports/export')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
