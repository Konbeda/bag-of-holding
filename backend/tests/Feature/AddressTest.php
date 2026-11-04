<?php

use App\Models\Address;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function addressPayload(array $overrides = []): array
{
    return [...[
        'recipient' => 'Ana Lima',
        'zip_code' => '01310-100',
        'street' => 'Avenida Paulista',
        'number' => '1000',
        'district' => 'Bela Vista',
        'city' => 'São Paulo',
        'state' => 'sp',
    ], ...$overrides];
}

it('normalizes the address and makes the first one default', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/addresses', addressPayload())
        ->assertCreated()
        ->assertJsonPath('data.zip_code', '01310100')
        ->assertJsonPath('data.state', 'SP')
        ->assertJsonPath('data.is_default', true);
});

it('keeps a single default address', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/addresses', addressPayload());
    $this->postJson('/api/v1/addresses', addressPayload(['is_default' => true]));

    expect($user->addresses()->where('is_default', true)->count())->toBe(1);
});

it('promotes another address when the default is deleted', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $first = $this->postJson('/api/v1/addresses', addressPayload())->json('data.id');
    $second = $this->postJson('/api/v1/addresses', addressPayload())->json('data.id');

    $this->deleteJson("/api/v1/addresses/{$first}")->assertNoContent();

    expect(Address::find($second)->is_default)->toBeTrue();
});

it('names the zip code field in portuguese when invalid', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/addresses', addressPayload(['zip_code' => '123']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.zip_code.0', fn (string $message) => str_contains($message, 'CEP'));
});

it('forbids managing addresses of another user', function () {
    $address = Address::factory()->create();
    Sanctum::actingAs(User::factory()->create());

    $this->putJson("/api/v1/addresses/{$address->id}", addressPayload())->assertForbidden();
    $this->deleteJson("/api/v1/addresses/{$address->id}")->assertForbidden();
    $this->assertModelExists($address);
});
