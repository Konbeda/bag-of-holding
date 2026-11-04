<?php

namespace App\Actions\Cart;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Validation\ValidationException;

class ManageCartAction
{
    public function add(Cart $cart, int $productId, int $quantity): void
    {
        $product = Product::active()->find($productId);

        if (! $product) {
            throw ValidationException::withMessages(['product_id' => 'Este produto não está disponível.']);
        }

        $current = (int) $cart->items()->where('product_id', $productId)->value('quantity');

        $this->store($cart, $product, $current + $quantity);
    }

    public function update(Cart $cart, Product $product, int $quantity): void
    {
        abort_unless($cart->items()->where('product_id', $product->id)->exists(), 404);

        $this->store($cart, $product, $quantity);
    }

    /** @param list<array{product_id: int, quantity: int}> $items */
    public function merge(Cart $cart, array $items): void
    {
        $products = Product::active()->whereIn('id', array_column($items, 'product_id'))->get()->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if (! $product || $product->stock === 0) {
                continue;
            }

            $current = (int) $cart->items()->where('product_id', $product->id)->value('quantity');

            $cart->items()->updateOrCreate(
                ['product_id' => $product->id],
                ['quantity' => min($current + $item['quantity'], $product->stock, 99)],
            );
        }
    }

    private function store(Cart $cart, Product $product, int $quantity): void
    {
        if (! $product->is_active) {
            throw ValidationException::withMessages(['product_id' => 'Este produto não está disponível.']);
        }

        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Temos apenas {$product->stock} unidade(s) de {$product->name} em estoque.",
            ]);
        }

        $cart->items()->updateOrCreate(['product_id' => $product->id], ['quantity' => $quantity]);
    }
}
