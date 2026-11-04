<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('categories', [CatalogController::class, 'categories']);
Route::get('brands', [CatalogController::class, 'brands']);
Route::get('shipping/quote', ShippingController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    Route::apiResource('addresses', AddressController::class)->except('show');

    Route::get('cart', [CartController::class, 'show']);
    Route::delete('cart', [CartController::class, 'clear']);
    Route::post('cart/merge', [CartController::class, 'merge']);
    Route::post('cart/items', [CartController::class, 'addItem']);
    Route::patch('cart/items/{product}', [CartController::class, 'updateItem']);
    Route::delete('cart/items/{product}', [CartController::class, 'removeItem']);

    Route::post('checkout', CheckoutController::class);

    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order:number}', [OrderController::class, 'show']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('dashboard', DashboardController::class);

        Route::apiResource('products', AdminProductController::class);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order:number}', [AdminOrderController::class, 'show']);
        Route::patch('orders/{order:number}/status', [AdminOrderController::class, 'updateStatus']);
    });
});
