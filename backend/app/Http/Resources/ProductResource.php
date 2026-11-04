<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price_cents' => $this->price_cents,
            'compare_at_price_cents' => $this->compare_at_price_cents,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'specifications' => $this->specifications ?? (object) [],
            'category' => new TaxonomyResource($this->whenLoaded('category')),
            'brand' => new TaxonomyResource($this->whenLoaded('brand')),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'url' => $image->url(),
                'alt' => $image->alt ?? $this->name,
            ])),
        ];
    }
}
