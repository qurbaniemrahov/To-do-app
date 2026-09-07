<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app');
Route::view('/dashboard', 'dashboard');

Route::get('/style.css', function () {
    return response()->file(dirname(base_path()).'/Front-end/style.css', [
        'Content-Type' => 'text/css; charset=UTF-8',
    ]);
});

Route::get('/overrides.css', function () {
    return response()->file(dirname(base_path()).'/Front-end/overrides.css', [
        'Content-Type' => 'text/css; charset=UTF-8',
    ]);
});

Route::get('/app.js', function () {
    return response()->file(dirname(base_path()).'/Front-end/app.js', [
        'Content-Type' => 'application/javascript; charset=UTF-8',
    ]);
});

Route::get('/dashboard/style.css', function () {
    return response()->file(dirname(base_path()).'/Dashboard/style.css', [
        'Content-Type' => 'text/css; charset=UTF-8',
    ]);
});

Route::get('/dashboard/app.js', function () {
    return response()->file(dirname(base_path()).'/Dashboard/app.js', [
        'Content-Type' => 'application/javascript; charset=UTF-8',
    ]);
});
