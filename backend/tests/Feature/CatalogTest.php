<?php

use App\Models\Brand;
use App\Models\Category;

it('lists only active products with pagination', function () {
    product(['name' => 'Ativo']);
    product(['name' => 'Oculto', 'is_active' => false]);

    $this->getJson('/api/v1/products')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Ativo')
        ->assertJsonStructure(['data', 'links', 'meta']);
});

it('filters by search, category, brand, price and stock', function () {
    $category = Category::factory()->create(['slug' => 'dados']);
    $brand = Brand::factory()->create(['slug' => 'forja']);

    product(['name' => 'Dado Azul', 'category_id' => $category, 'brand_id' => $brand, 'price_cents' => 5000]);
    product(['name' => 'Dado Vermelho', 'price_cents' => 9000, 'stock' => 0]);
    product(['name' => 'Livro', 'price_cents' => 20000]);

    $names = fn (string $query) => collect($this->getJson("/api/v1/products?{$query}")->assertOk()->json('data'))
        ->pluck('name')->sort()->values()->all();

    expect($names('q=dado'))->toBe(['Dado Azul', 'Dado Vermelho'])
        ->and($names('category=dados'))->toBe(['Dado Azul'])
        ->and($names('brand=forja'))->toBe(['Dado Azul'])
        ->and($names('min_price=8000&max_price=10000'))->toBe(['Dado Vermelho'])
        ->and($names('q=dado&in_stock=1'))->toBe(['Dado Azul']);
});

it('treats search wildcards as plain text', function () {
    product(['name' => 'Dado', 'description' => 'simples']);

    $this->getJson('/api/v1/products?q=%25')->assertOk()->assertJsonCount(0, 'data');
});

it('sorts by price', function () {
    product(['name' => 'Caro', 'price_cents' => 9000]);
    product(['name' => 'Barato', 'price_cents' => 1000]);

    $this->getJson('/api/v1/products?sort=price_asc')->assertJsonPath('data.0.name', 'Barato');
    $this->getJson('/api/v1/products?sort=price_desc')->assertJsonPath('data.0.name', 'Caro');
});

it('rejects an invalid sort option', function () {
    $this->getJson('/api/v1/products?sort=hack')->assertUnprocessable();
});

it('shows a product by slug and hides inactive ones', function () {
    product(['slug' => 'visivel']);
    product(['slug' => 'oculto', 'is_active' => false]);

    $this->getJson('/api/v1/products/visivel')->assertOk()->assertJsonPath('data.slug', 'visivel');
    $this->getJson('/api/v1/products/oculto')->assertNotFound()->assertJson(['message' => 'Não encontrado']);
});

it('counts only active products per category', function () {
    $category = Category::factory()->create();
    product(['category_id' => $category]);
    product(['category_id' => $category, 'is_active' => false]);

    $this->getJson('/api/v1/categories')->assertOk()->assertJsonPath('data.0.products_count', 1);
});

it('quotes shipping by region with free shipping above the threshold', function () {
    $this->getJson('/api/v1/shipping/quote?zip_code=01310-100&subtotal_cents=1000')
        ->assertOk()
        ->assertJsonPath('data.price_cents', 1490)
        ->assertJsonPath('data.region', 'Grande São Paulo');

    $this->getJson('/api/v1/shipping/quote?zip_code=01310100&subtotal_cents=30000')
        ->assertJsonPath('data.price_cents', 0);

    $this->getJson('/api/v1/shipping/quote?zip_code=123')->assertUnprocessable();
});

it('seeds the catalog with forty products', function () {
    $this->seed();

    $this->getJson('/api/v1/products?per_page=1')->assertJsonPath('meta.total', 40);
    $this->seed();
    $this->getJson('/api/v1/products?per_page=1')->assertJsonPath('meta.total', 40);
});
