<?php

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;

it('reports the application as healthy', function () {
    $this->get('/up')->assertOk();
});

it('rejects guests in portuguese', function () {
    $this->getJson('/api/v1/me')
        ->assertUnauthorized()
        ->assertJson(['message' => 'Não autenticado.']);
});

it('answers unknown api routes in portuguese', function () {
    $this->getJson('/api/v1/unknown')
        ->assertNotFound()
        ->assertJson(['message' => 'Não encontrado']);
});

it('returns the authenticated user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/me')->assertOk()->assertJsonPath('data.email', $user->email);
});

it('translates validation messages to portuguese', function () {
    $errors = Validator::make([], ['email' => 'required'])->errors();

    expect($errors->first('email'))->toContain('obrigatório');
});
