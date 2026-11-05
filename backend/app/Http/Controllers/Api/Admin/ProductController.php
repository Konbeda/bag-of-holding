<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Products\SaveProductAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Requests\ListProductsRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    private const RELATIONS = ['category', 'brand', 'images'];

    public function index(ListProductsRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();

        return ProductResource::collection(
            Product::with(self::RELATIONS)->filter($filters)->paginate($filters['per_page'] ?? 20)->withQueryString()
        );
    }

    public function store(ProductRequest $request, SaveProductAction $save): JsonResponse
    {
        $product = $save->handle(new Product, $request->validated());

        return (new ProductResource($product->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load(self::RELATIONS));
    }

    public function update(ProductRequest $request, Product $product, SaveProductAction $save): ProductResource
    {
        return new ProductResource($save->handle($product, $request->validated())->load(self::RELATIONS));
    }

    public function destroy(Product $product, SaveProductAction $save): Response
    {
        $save->delete($product);

        return response()->noContent();
    }
}
