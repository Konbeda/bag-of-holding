<?php

namespace App\Http\Controllers\Api;

use App\Actions\Orders\CreateOrderAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function __invoke(CheckoutRequest $request, CreateOrderAction $createOrder): JsonResponse
    {
        $order = $createOrder->handle(
            $request->user(),
            Address::findOrFail($request->validated('address_id')),
            PaymentMethod::from($request->validated('payment_method')),
            ['simulated_outcome' => $request->validated('simulated_outcome')],
        );

        if ($order->status === OrderStatus::Canceled) {
            throw ValidationException::withMessages([
                'payment' => 'Pagamento recusado. Seu carrinho foi mantido: escolha outra forma de pagamento e tente novamente.',
            ]);
        }

        return (new OrderResource($order->load(['items', 'payments'])))->response()->setStatusCode(201);
    }
}
