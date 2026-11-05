<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Orders\ChangeOrderStatusAction;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const RELATIONS = ['user', 'items', 'payments'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate(['status' => ['nullable', Rule::enum(OrderStatus::class)]]);

        return OrderResource::collection(
            Order::with(self::RELATIONS)
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->latest('id')
                ->paginate(20)
                ->withQueryString()
        );
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(self::RELATIONS));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, ChangeOrderStatusAction $changeStatus): OrderResource
    {
        $order = $changeStatus->handle($order, OrderStatus::from($request->validated('status')));

        return new OrderResource($order->load(self::RELATIONS));
    }
}
