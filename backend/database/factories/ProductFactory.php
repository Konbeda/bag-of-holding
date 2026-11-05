<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(4, true);

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'price_cents' => fake()->numberBetween(1000, 30000),
            'stock' => 10,
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
