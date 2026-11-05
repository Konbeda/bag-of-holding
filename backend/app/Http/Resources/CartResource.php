<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items->filter(fn ($item) => $item->product !== null);

        return [
            'items' => $items->values()->map(fn ($item) => [
                'product' => new ProductResource($item->product),
                'quantity' => $item->quantity,
                'line_total_cents' => $item->quantity * $item->product->price_cents,
                'is_available' => $item->product->is_active && $item->product->stock >= $item->quantity,
            ]),
            'items_count' => $items->sum('quantity'),
            'subtotal_cents' => $items->sum(fn ($item) => $item->quantity * $item->product->price_cents),
        ];
    }
}
