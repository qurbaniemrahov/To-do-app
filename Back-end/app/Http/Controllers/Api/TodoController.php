<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TodoController extends Controller
{
    public function index(Request $request): Collection
    {
        return $request->user()->todos()->latest()->get();
    }

    public function show(Request $request, Todo $todo): Todo
    {
        if ($todo->user_id !== $request->user()->id) {
            abort(404);
        }

        return $todo;
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo = $request->user()->todos()->create($data);

        return response()->json($todo, 201);
    }

    public function update(Request $request, Todo $todo): Todo
    {

        if ($todo->user_id !== $request->user()->id) {
            abort(404);
        }
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo->update($data);

        return $todo;
    }

    public function destroy(Request $request, Todo $todo): Response
    {
        if ($todo->user_id !== $request->user()->id) {
            abort(404);
        }

        $todo->delete();

        return response()->noContent();
    }
}
