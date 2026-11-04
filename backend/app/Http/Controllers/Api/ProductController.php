<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListProductsRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(ListProductsRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();

        $products = Product::active()
            ->with(['category', 'brand', 'images'])
            ->filter($filters)
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        return new ProductResource(
            Product::active()->with(['category', 'brand', 'images'])->where('slug', $slug)->firstOrFail()
        );
    }
}
