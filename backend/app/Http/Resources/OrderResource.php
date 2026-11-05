<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'number' => $this->number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'subtotal_cents' => $this->subtotal_cents,
            'shipping_cents' => $this->shipping_cents,
            'total_cents' => $this->total_cents,
            'shipping_address' => $this->shipping_address,
            'created_at' => $this->created_at->toIso8601String(),
            'customer' => new UserResource($this->whenLoaded('user')),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'unit_price_cents' => $item->unit_price_cents,
                'quantity' => $item->quantity,
                'line_total_cents' => $item->unit_price_cents * $item->quantity,
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'method' => $payment->method->value,
                'method_label' => $payment->method->label(),
                'status' => $payment->status->value,
                'status_label' => $payment->status->label(),
                'amount_cents' => $payment->amount_cents,
            ])),
        ];
    }
}
