<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $validated = $request->validate(['days' => ['sometimes', 'integer', 'in:7,30']]);
        $days = (int) ($validated['days'] ?? 7);
        $today = CarbonImmutable::today();
        $periodStart = $today->subDays($days - 1)->startOfDay();
        $previousStart = $periodStart->subDays($days);
        $totalTasks = Todo::count();
        $completedTasks = Todo::where('completed', true)->count();
        $activity = Todo::query()
            ->selectRaw('DATE(updated_at) as activity_date, COUNT(*) as total')
            ->where('completed', true)
            ->whereBetween('updated_at', [$periodStart, $today->endOfDay()])
            ->groupByRaw('DATE(updated_at)')
            ->pluck('total', 'activity_date');

        return response()->json([
            'total_users' => User::count(),
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'active_tasks' => $totalTasks - $completedTasks,
            'completion_rate' => $totalTasks === 0 ? 0 : round(($completedTasks / $totalTasks) * 100, 1),
            'changes' => [
                'tasks' => $this->periodChange(Todo::query(), 'created_at', $periodStart, $previousStart),
                'completed' => $this->periodChange(Todo::where('completed', true), 'updated_at', $periodStart, $previousStart),
                'users' => $this->periodChange(User::query(), 'created_at', $periodStart, $previousStart),
            ],
            'activity' => collect(range(0, $days - 1))->map(function (int $offset) use ($periodStart, $activity): array {
                $date = $periodStart->addDays($offset)->toDateString();

                return ['date' => $date, 'completed' => (int) ($activity[$date] ?? 0)];
            })->values(),
            'recent_tasks' => Todo::with('user:id,name,email')
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }

    public function tasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'string', 'in:all,active,completed'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $tasks = Todo::with('user:id,name,email')
            ->when($validated['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhereHas('user', fn (Builder $userQuery) => $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when(($validated['status'] ?? 'all') !== 'all', fn (Builder $query) => $query
                ->where('completed', $validated['status'] === 'completed'))
            ->latest()
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return response()->json($tasks);
    }

    public function users(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->withCount([
                'todos',
                'todos as completed_todos_count' => fn (Builder $query) => $query->where('completed', true),
            ])
            ->when($validated['search'] ?? null, fn (Builder $query, string $search) => $query
                ->where(fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->latest()
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return response()->json($users);
    }

    public function export(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $output = fopen('php://output', 'wb');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['ID', 'Task', 'İstifadəçi', 'E-poçt', 'Status', 'Yaradılma tarixi'], ',', '"', '');

            Todo::with('user:id,name,email')->latest()->chunk(500, function ($tasks) use ($output): void {
                foreach ($tasks as $task) {
                    fputcsv($output, [
                        $task->id,
                        $task->title,
                        $task->user?->name ?? 'Silinmiş istifadəçi',
                        $task->user?->email ?? '',
                        $task->completed ? 'Tamamlandı' : 'Aktiv',
                        $task->created_at?->toDateTimeString(),
                    ], ',', '"', '');
                }
            });

            fclose($output);
        }, 'flowlist-hesabat-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function periodChange(Builder $query, string $column, CarbonImmutable $periodStart, CarbonImmutable $previousStart): float
    {
        $current = (clone $query)->whereBetween($column, [$periodStart, now()])->count();
        $previous = (clone $query)->whereBetween($column, [$previousStart, $periodStart->subSecond()])->count();

        if ($previous === 0) {
            return $current === 0 ? 0 : 100;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
