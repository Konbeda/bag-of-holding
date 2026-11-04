<?php

use App\Contracts\PaymentGateway;
use App\Enums\OrderStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;

it('creates a paid order, lowers stock and clears the cart', function () {
    $product = product(['name' => 'Dado', 'price_cents' => 1000, 'stock' => 5]);
    $user = customerWithCart([$product->id => 2]);

    checkout($user)
        ->assertCreated()
        ->assertJsonPath('data.status', 'paid')
        ->assertJsonPath('data.status_label', 'Pago')
        ->assertJsonPath('data.subtotal_cents', 2000)
        ->assertJsonPath('data.shipping_cents', 1490)
        ->assertJsonPath('data.total_cents', 3490)
        ->assertJsonPath('data.items.0.product_name', 'Dado')
        ->assertJsonPath('data.payments.0.status', 'approved');

    expect($product->fresh()->stock)->toBe(3)
        ->and($user->cart->items()->count())->toBe(0);
});

it('applies free shipping from the threshold', function () {
    $user = customerWithCart([product(['price_cents' => 30000])->id => 1]);

    checkout($user)->assertCreated()->assertJsonPath('data.shipping_cents', 0);
});

it('cancels the order, restores stock and keeps the cart when payment is declined', function () {
    $product = product(['stock' => 5]);
    $user = customerWithCart([$product->id => 2]);

    checkout($user, 'declined')
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('payment');

    expect($product->fresh()->stock)->toBe(5)
        ->and($user->cart->items()->count())->toBe(1)
        ->and(Order::first()->status)->toBe(OrderStatus::Canceled)
        ->and(Order::first()->payments()->first()->status->value)->toBe('declined');
});

it('restores stock when the gateway crashes', function () {
    $product = product(['stock' => 5]);
    $user = customerWithCart([$product->id => 2]);

    $this->mock(PaymentGateway::class)->shouldReceive('charge')->andThrow(new RuntimeException('falha'));

    $this->withoutExceptionHandling();

    expect(fn () => checkout($user))->toThrow(RuntimeException::class);

    expect($product->fresh()->stock)->toBe(5)
        ->and(Order::first()->status)->toBe(OrderStatus::Canceled)
        ->and($user->cart->items()->count())->toBe(1);
});

it('hides crash details from customers in production', function () {
    config(['app.debug' => false]);
    $user = customerWithCart([product()->id => 1]);

    $this->mock(PaymentGateway::class)->shouldReceive('charge')->andThrow(new RuntimeException('segredo interno'));

    checkout($user)->assertServerError()->assertExactJson(['message' => 'Algo deu errado. Tente novamente.']);
});

it('rejects an empty cart', function () {
    checkout(customerWithCart([]))->assertUnprocessable()->assertJsonValidationErrorFor('cart');

    expect(Order::count())->toBe(0);
});

it('rejects a cart above the current stock without changing anything', function () {
    $product = product(['stock' => 5, 'name' => 'Dado']);
    $user = customerWithCart([$product->id => 3]);
    $product->update(['stock' => 2]);

    checkout($user)
        ->assertUnprocessable()
        ->assertJsonPath('errors.cart.0', 'Temos apenas 2 unidade(s) de Dado em estoque.');

    expect($product->fresh()->stock)->toBe(2)->and(Order::count())->toBe(0);
});

it('rejects products that were deactivated or deleted', function () {
    $inactive = product();
    $deleted = product();
    $user = customerWithCart([$inactive->id => 1, $deleted->id => 1]);
    $inactive->update(['is_active' => false]);
    $deleted->delete();

    checkout($user)->assertUnprocessable()->assertJsonValidationErrorFor('cart');
});

it('rejects the address of another user', function () {
    $user = customerWithCart([product()->id => 1]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/checkout', [
        'address_id' => Address::factory()->create()->id,
        'payment_method' => 'pix',
        'simulated_outcome' => 'approved',
    ])->assertUnprocessable()->assertJsonValidationErrorFor('address_id');
});

it('blocks a second checkout while one is running', function () {
    $user = customerWithCart([product()->id => 1]);
    $lock = Cache::lock("checkout:{$user->id}", 30);
    $lock->get();

    checkout($user)->assertStatus(409);

    $lock->release();
    expect(Order::count())->toBe(0);
});

it('keeps order history when the product changes later', function () {
    $product = product(['name' => 'Original', 'price_cents' => 1000]);
    $user = customerWithCart([$product->id => 1]);
    $number = checkout($user)->json('data.number');

    $product->update(['name' => 'Novo', 'price_cents' => 9999]);
    $user->addresses()->first()->update(['city' => 'Outra']);

    $this->getJson("/api/v1/orders/{$number}")
        ->assertOk()
        ->assertJsonPath('data.items.0.product_name', 'Original')
        ->assertJsonPath('data.items.0.unit_price_cents', 1000)
        ->assertJsonPath('data.shipping_address.city', 'São Paulo');
});

it('shows customers only their own orders', function () {
    $user = customerWithCart([product()->id => 1]);
    $number = checkout($user)->json('data.number');

    $this->getJson('/api/v1/orders')->assertOk()->assertJsonCount(1, 'data');

    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/orders')->assertJsonCount(0, 'data');
    $this->getJson("/api/v1/orders/{$number}")->assertForbidden()->assertJson(['message' => 'Esta ação não é autorizada.']);
});
