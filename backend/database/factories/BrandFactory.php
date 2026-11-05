<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Brand> */
class BrandFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return ['name' => Str::title($name), 'slug' => Str::slug($name)];
    }
}
