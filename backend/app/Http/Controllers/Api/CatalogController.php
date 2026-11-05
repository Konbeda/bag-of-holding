<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxonomyResource;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    public function categories(): AnonymousResourceCollection
    {
        return TaxonomyResource::collection($this->withActiveCount(Category::query())->orderBy('name')->get());
    }

    public function brands(): AnonymousResourceCollection
    {
        return TaxonomyResource::collection($this->withActiveCount(Brand::query())->orderBy('name')->get());
    }

    private function withActiveCount(Builder $query): Builder
    {
        return $query->withCount(['products' => fn (Builder $query) => $query->where('is_active', true)]);
    }
}
