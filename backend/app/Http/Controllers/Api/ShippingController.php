<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShippingQuoteRequest;
use App\Services\Shipping\ShippingCalculator;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function __invoke(ShippingQuoteRequest $request, ShippingCalculator $shipping): JsonResponse
    {
        $quote = $shipping->quote($request->validated('zip_code'), (int) $request->validated('subtotal_cents', 0));

        return response()->json(['data' => [
            'price_cents' => $quote->priceCents,
            'estimated_days' => $quote->estimatedDays,
            'region' => $quote->region,
            'free_shipping_from_cents' => ShippingCalculator::FREE_SHIPPING_FROM_CENTS,
        ]]);
    }
}
