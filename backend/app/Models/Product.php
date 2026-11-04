<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['category_id', 'brand_id', 'name', 'slug', 'description', 'price_cents', 'compare_at_price_cents', 'stock', 'is_active', 'is_featured', 'specifications'])]
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'specifications' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param array<string, mixed> $filters */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, function (Builder $query, string $term) {
                $like = '%'.addcslashes($term, '\\%_').'%';
                $query->where(fn (Builder $query) => $query->where('name', 'like', $like)->orWhere('description', 'like', $like));
            })
            ->when($filters['category'] ?? null, fn (Builder $query, string $slug) => $query->whereRelation('category', 'slug', $slug))
            ->when($filters['brand'] ?? null, fn (Builder $query, string $slug) => $query->whereRelation('brand', 'slug', $slug))
            ->when(isset($filters['min_price']), fn (Builder $query) => $query->where('price_cents', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn (Builder $query) => $query->where('price_cents', '<=', $filters['max_price']))
            ->when($filters['in_stock'] ?? false, fn (Builder $query) => $query->where('stock', '>', 0))
            ->when($filters['featured'] ?? false, fn (Builder $query) => $query->where('is_featured', true));

        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price_cents')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_cents')->orderBy('id'),
            'name' => $query->orderBy('name')->orderBy('id'),
            default => $query->latest()->orderByDesc('id'),
        };
    }
}
