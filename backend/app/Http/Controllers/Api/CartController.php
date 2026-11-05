<?php

namespace App\Http\Controllers\Api;

use App\Actions\Cart\ManageCartAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CartItemRequest;
use App\Http\Requests\MergeCartRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private ManageCartAction $cart) {}

    public function show(Request $request): CartResource
    {
        return $this->respond($this->cartOf($request));
    }

    public function addItem(CartItemRequest $request): CartResource
    {
        $cart = $this->cartOf($request);
        $this->cart->add($cart, $request->integer('product_id'), $request->integer('quantity'));

        return $this->respond($cart);
    }

    public function updateItem(CartItemRequest $request, Product $product): CartResource
    {
        $cart = $this->cartOf($request);
        $this->cart->update($cart, $product, $request->integer('quantity'));

        return $this->respond($cart);
    }

    public function removeItem(Request $request, Product $product): CartResource
    {
        $cart = $this->cartOf($request);
        $cart->items()->where('product_id', $product->id)->delete();

        return $this->respond($cart);
    }

    public function clear(Request $request): CartResource
    {
        $cart = $this->cartOf($request);
        $cart->items()->delete();

        return $this->respond($cart);
    }

    public function merge(MergeCartRequest $request): CartResource
    {
        $cart = $this->cartOf($request);
        $this->cart->merge($cart, $request->validated('items'));

        return $this->respond($cart);
    }

    private function cartOf(Request $request): Cart
    {
        $cart = $request->user()->cart()->firstOrCreate();

        // A lazily created cart is not a new resource for the client, so keep the status at 200
        $cart->wasRecentlyCreated = false;

        return $cart;
    }

    private function respond(Cart $cart): CartResource
    {
        return new CartResource($cart->load('items.product.images'));
    }
}
