<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChangeOrderStatusAction
{
    public function handle(Order $order, OrderStatus $status): Order
    {
        return DB::transaction(function () use ($order, $status) {
            $order = Order::lockForUpdate()->findOrFail($order->id);

            if (! $order->status->canTransitionTo($status)) {
                throw ValidationException::withMessages([
                    'status' => "Um pedido com status \"{$order->status->label()}\" não pode passar para \"{$status->label()}\".",
                ]);
            }

            if ($status === OrderStatus::Canceled) {
                $this->restoreStock($order);
                $order->payments()->where('status', PaymentStatus::Approved)->update(['status' => PaymentStatus::Refunded]);
            }

            $order->update(['status' => $status]);

            return $order;
        });
    }

    private function restoreStock(Order $order): void
    {
        $items = $order->items()->whereNotNull('product_id')->orderBy('product_id')->get();

        foreach ($items as $item) {
            Product::withTrashed()->whereKey($item->product_id)->increment('stock', $item->quantity);
        }
    }
}
