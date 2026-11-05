<?php

use App\Models\User;

it('registers a customer and returns a token', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ana',
        'email' => 'ANA@example.com',
        'password' => 'segredo123',
        'password_confirmation' => 'segredo123',
    ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'ana@example.com')
        ->assertJsonPath('data.role', 'customer')
        ->assertJsonStructure(['token']);
});

it('ignores a role sent during registration', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ana',
        'email' => 'ana@example.com',
        'password' => 'segredo123',
        'password_confirmation' => 'segredo123',
        'role' => 'admin',
    ])->assertCreated()->assertJsonPath('data.role', 'customer');
});

it('logs in with valid credentials and the token works', function () {
    User::factory()->create(['email' => 'ana@example.com', 'password' => 'segredo123']);

    $token = $this->postJson('/api/v1/auth/login', ['email' => 'ana@example.com', 'password' => 'segredo123'])
        ->assertOk()
        ->json('token');

    $this->withToken($token)->getJson('/api/v1/me')->assertOk();
});

it('rejects wrong credentials in portuguese', function () {
    User::factory()->create(['email' => 'ana@example.com', 'password' => 'segredo123']);

    $this->postJson('/api/v1/auth/login', ['email' => 'ana@example.com', 'password' => 'errada'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'Essas credenciais não foram encontradas em nossos registros.');
});

it('revokes the token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

    expect($user->tokens()->count())->toBe(0);
});

it('throttles repeated auth attempts in portuguese', function () {
    foreach (range(1, 10) as $attempt) {
        $this->postJson('/api/v1/auth/login', ['email' => 'ana@example.com', 'password' => 'errada']);
    }

    $this->postJson('/api/v1/auth/login', ['email' => 'ana@example.com', 'password' => 'errada'])
        ->assertTooManyRequests()
        ->assertJsonPath('message', 'Muitas tentativas. Aguarde um pouco e tente novamente.');
});
