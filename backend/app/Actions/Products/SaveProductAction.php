<?php

namespace App\Actions\Products;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveProductAction
{
    /** @param array<string, mixed> $data */
    public function handle(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->fill(Arr::except($data, 'images'))->save();

            if (array_key_exists('images', $data)) {
                $product->images()->delete();

                foreach (array_values($data['images']) as $position => $image) {
                    $product->images()->create([...$image, 'position' => $position]);
                }
            }

            return $product;
        });
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            CartItem::where('product_id', $product->id)->delete();
            $product->delete();
        });
    }
}
