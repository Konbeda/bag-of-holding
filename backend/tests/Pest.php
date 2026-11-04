<?php

use App\Models\Address;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('Feature');
pest()->extend(TestCase::class)->in('Concurrency');

function actingAsAdmin(): User
{
    $admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($admin);

    return $admin;
}

/** @param array<int, int> $items quantities keyed by product id */
function customerWithCart(array $items): User
{
    $user = User::factory()->create();
    Address::factory()->for($user)->create(['is_default' => true]);

    $cart = $user->cart()->create();

    foreach ($items as $productId => $quantity) {
        $cart->items()->create(['product_id' => $productId, 'quantity' => $quantity]);
    }

    return $user;
}

function checkout(User $user, string $outcome = 'approved')
{
    Sanctum::actingAs($user);

    return test()->postJson('/api/v1/checkout', [
        'address_id' => $user->addresses()->first()->id,
        'payment_method' => 'pix',
        'simulated_outcome' => $outcome,
    ]);
}

function product(array $attributes = []): Product
{
    return Product::factory()->create($attributes);
}
