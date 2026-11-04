<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/me', fn (Request $request) => $request->user())->middleware('auth:sanctum');
