<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function productPayload(array $overrides = []): array
{
    return [...[
        'category_id' => Category::factory()->create()->id,
        'brand_id' => Brand::factory()->create()->id,
        'name' => 'Dado Novo',
        'description' => 'Descrição',
        'price_cents' => 1500,
        'stock' => 3,
    ], ...$overrides];
}

function placedOrder(?Product $product = null): string
{
    $user = customerWithCart([($product ?? product())->id => 1]);

    return checkout($user)->assertCreated()->json('data.number');
}

it('blocks guests and customers from admin routes', function () {
    $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();

    Sanctum::actingAs(User::factory()->create());

    foreach (['dashboard', 'products', 'orders'] as $route) {
        $this->getJson("/api/v1/admin/{$route}")
            ->assertForbidden()
            ->assertJson(['message' => 'Acesso restrito à administração.']);
    }
});

it('creates a product generating the slug and images', function () {
    actingAsAdmin();

    $this->postJson('/api/v1/admin/products', productPayload(['images' => [['path' => 'https://cdn.test/a.png']]]))
        ->assertCreated()
        ->assertJsonPath('data.slug', 'dado-novo')
        ->assertJsonPath('data.images.0.url', 'https://cdn.test/a.png');
});

it('rejects a duplicated slug and a previous price below the price', function () {
    actingAsAdmin();
    product(['slug' => 'dado-novo']);

    $this->postJson('/api/v1/admin/products', productPayload())->assertJsonValidationErrorFor('slug');
    $this->postJson('/api/v1/admin/products', productPayload(['name' => 'Outro', 'compare_at_price_cents' => 100]))
        ->assertJsonValidationErrorFor('compare_at_price_cents');
});

it('updates a product keeping its own slug and replacing images', function () {
    actingAsAdmin();
    $product = product(['slug' => 'dado-novo']);
    $product->images()->create(['path' => 'old.png']);

    $this->putJson("/api/v1/admin/products/{$product->id}", productPayload([
        'slug' => 'dado-novo',
        'stock' => 9,
        'images' => [['path' => 'new.png']],
    ]))
        ->assertOk()
        ->assertJsonPath('data.stock', 9)
        ->assertJsonCount(1, 'data.images');
});

it('lists inactive products for admins', function () {
    actingAsAdmin();
    product(['is_active' => false]);

    $this->getJson('/api/v1/admin/products')->assertOk()->assertJsonCount(1, 'data');
});

it('deletes a product, cleans carts and keeps order history', function () {
    $product = product();
    $number = placedOrder($product);
    $other = customerWithCart([$product->id => 1]);

    actingAsAdmin();
    $this->deleteJson("/api/v1/admin/products/{$product->id}")->assertNoContent();

    $this->assertSoftDeleted($product);
    expect($other->cart->items()->count())->toBe(0);

    $this->getJson("/api/v1/admin/orders/{$number}")->assertOk()->assertJsonPath('data.items.0.product_name', $product->name);
});

it('walks an order through the allowed statuses', function () {
    $number = placedOrder();
    actingAsAdmin();

    foreach (['shipped', 'delivered'] as $status) {
        $this->patchJson("/api/v1/admin/orders/{$number}/status", ['status' => $status])
            ->assertOk()
            ->assertJsonPath('data.status', $status);
    }
});

it('rejects invalid status transitions in portuguese', function () {
    $number = placedOrder();
    actingAsAdmin();

    $this->patchJson("/api/v1/admin/orders/{$number}/status", ['status' => 'delivered'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.status.0', 'Um pedido com status "Pago" não pode passar para "Entregue".');
});

it('restores stock and refunds when a paid order is canceled, and only once', function () {
    $product = product(['stock' => 5]);
    $number = placedOrder($product);
    expect($product->fresh()->stock)->toBe(4);

    actingAsAdmin();

    $this->patchJson("/api/v1/admin/orders/{$number}/status", ['status' => 'canceled'])
        ->assertOk()
        ->assertJsonPath('data.payments.0.status', 'refunded');

    expect($product->fresh()->stock)->toBe(5);

    $this->patchJson("/api/v1/admin/orders/{$number}/status", ['status' => 'canceled'])->assertUnprocessable();

    expect($product->fresh()->stock)->toBe(5);
});

it('filters admin orders by status and lets admins view any order', function () {
    $number = placedOrder();
    actingAsAdmin();

    $this->getJson('/api/v1/admin/orders?status=paid')->assertJsonCount(1, 'data')->assertJsonStructure(['data' => [['customer']]]);
    $this->getJson('/api/v1/admin/orders?status=shipped')->assertJsonCount(0, 'data');
    $this->getJson("/api/v1/orders/{$number}")->assertOk();
});

it('summarizes sales counting only revenue orders', function () {
    $paid = product(['name' => 'Vendido', 'price_cents' => 1000, 'stock' => 3]);
    placedOrder($paid);
    checkout(customerWithCart([product()->id => 1]), 'declined');

    actingAsAdmin();

    $this->getJson('/api/v1/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('data.revenue_cents', 2490)
        ->assertJsonPath('data.revenue_orders_count', 1)
        ->assertJsonPath('data.orders_by_status.canceled', 1)
        ->assertJsonPath('data.top_products.0.product_name', 'Vendido')
        ->assertJsonPath('data.top_products.0.units', 1)
        ->assertJsonPath('data.sales_last_30_days.0.orders', 1)
        ->assertJsonPath('data.low_stock.0.name', 'Vendido');
});
