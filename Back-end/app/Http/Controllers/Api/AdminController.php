<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_tasks' => Todo::count(),
            'completed_tasks' => Todo::where('completed', true)->count(),
            'active_tasks' => Todo::where('completed', false)->count(),
            'recent_tasks' => Todo::with('user:id,name,email')
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    public function tasks()
    {
        return Todo::with('user:id,name,email')
            ->latest()
            ->get();
    }

    public function users()
    {
        return User::select('id', 'name', 'email', 'role', 'created_at')
            ->withCount('todos')
            ->latest()
            ->get();
    }
}
