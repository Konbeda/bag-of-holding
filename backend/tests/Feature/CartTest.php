<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('adds items, sums quantities and computes the subtotal', function () {
    $product = product(['price_cents' => 1000, 'stock' => 5]);

    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1])->assertOk();

    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 2])
        ->assertOk()
        ->assertJsonPath('data.items.0.quantity', 3)
        ->assertJsonPath('data.items_count', 3)
        ->assertJsonPath('data.subtotal_cents', 3000);
});

it('answers 200 when the cart is created on first access', function () {
    $this->getJson('/api/v1/cart')->assertOk()->assertJsonPath('data.items_count', 0);
});

it('refuses more than the available stock', function () {
    $product = product(['stock' => 2, 'name' => 'Dado']);

    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 3])
        ->assertUnprocessable()
        ->assertJsonPath('errors.quantity.0', 'Temos apenas 2 unidade(s) de Dado em estoque.');
});

it('refuses inactive and unknown products', function () {
    $inactive = product(['is_active' => false]);

    $this->postJson('/api/v1/cart/items', ['product_id' => $inactive->id, 'quantity' => 1])->assertUnprocessable();
    $this->postJson('/api/v1/cart/items', ['product_id' => 999999, 'quantity' => 1])->assertUnprocessable();
});

it('updates and removes items', function () {
    $product = product(['stock' => 5]);
    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1]);

    $this->patchJson("/api/v1/cart/items/{$product->id}", ['quantity' => 4])->assertJsonPath('data.items.0.quantity', 4);
    $this->deleteJson("/api/v1/cart/items/{$product->id}")->assertOk()->assertJsonCount(0, 'data.items');
});

it('answers 404 when updating an item outside the cart', function () {
    $product = product();

    $this->patchJson("/api/v1/cart/items/{$product->id}", ['quantity' => 1])->assertNotFound();
});

it('merges a guest cart clamping to stock and skipping unavailable products', function () {
    $limited = product(['stock' => 3]);
    $inactive = product(['is_active' => false]);
    $this->postJson('/api/v1/cart/items', ['product_id' => $limited->id, 'quantity' => 2]);

    $this->postJson('/api/v1/cart/merge', ['items' => [
        ['product_id' => $limited->id, 'quantity' => 5],
        ['product_id' => $inactive->id, 'quantity' => 1],
        ['product_id' => 999999, 'quantity' => 1],
    ]])
        ->assertOk()
        ->assertJsonCount(1, 'data.items')
        ->assertJsonPath('data.items.0.quantity', 3);
});

it('flags items that became unavailable', function () {
    $product = product(['stock' => 5]);
    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 3]);
    $product->update(['stock' => 1]);

    $this->getJson('/api/v1/cart')->assertJsonPath('data.items.0.is_available', false);
});

it('isolates carts between users', function () {
    $product = product();
    $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1]);

    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/cart')->assertJsonCount(0, 'data.items');
});
