<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
 public function index(Request $request)
{
    return $request->user()->todos()->latest()->get();
}

public function show(Request $request, Todo $todo)
{
    if ($todo->user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'Bu task sizə aid deyil.',
        ], 403);
    }

    return $todo;
}

public function store(Request $request)
{
    $data = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'completed' => ['sometimes', 'boolean'],
    ]);

    $todo = $request->user()->todos()->create($data);

    return response()->json($todo, 201);
}

    public function update(Request $request, Todo $todo)
    {

        if ($todo->user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'Bu task sizə aid deyil.',
        ], 403);
    }
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo->update($data);

        return $todo;
    }

  public function destroy(Request $request, Todo $todo)
{
    if ($todo->user_id !== $request->user()->id) {
        return response()->json([
            'message' => 'Bu task sizə aid deyil.',
        ], 403);
    }

    $todo->delete();

    return response()->noContent();
}
}