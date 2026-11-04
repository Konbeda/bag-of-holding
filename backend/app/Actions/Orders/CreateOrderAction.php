<?php

namespace App\Actions\Orders;

use App\Contracts\PaymentGateway;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Shipping\ShippingCalculator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class CreateOrderAction
{
    public function __construct(
        private PaymentGateway $gateway,
        private ShippingCalculator $shipping,
        private ChangeOrderStatusAction $changeStatus,
    ) {}

    /** @param array<string, mixed> $paymentContext */
    public function handle(User $user, Address $address, PaymentMethod $method, array $paymentContext = []): Order
    {
        $lock = Cache::lock("checkout:{$user->id}", 30);

        abort_unless($lock->get(), 409, 'Já existe uma compra em andamento. Aguarde um instante.');

        try {
            $order = $this->reserve($user, $address);

            // The gateway runs outside the transaction so a slow charge never holds stock locks
            try {
                $result = $this->gateway->charge($order, $method, $paymentContext);
            } catch (Throwable $e) {
                $this->changeStatus->handle($order, OrderStatus::Canceled);

                throw $e;
            }

            return DB::transaction(function () use ($user, $order, $method, $result) {
                $order->payments()->create([
                    'method' => $method,
                    'status' => $result->status,
                    'amount_cents' => $order->total_cents,
                    'provider_reference' => $result->reference,
                ]);

                if ($result->status !== PaymentStatus::Approved) {
                    return $this->changeStatus->handle($order, OrderStatus::Canceled);
                }

                $user->cart->items()->delete();

                return $this->changeStatus->handle($order, OrderStatus::Paid);
            });
        } finally {
            $lock->release();
        }
    }

    private function reserve(User $user, Address $address): Order
    {
        return DB::transaction(function () use ($user, $address) {
            $items = $user->cart()->firstOrCreate()->items()->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Seu carrinho está vazio.']);
            }

            // Sorted ids keep lock order stable across concurrent checkouts and prevent deadlocks
            $products = Product::whereIn('id', $items->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $this->ensureAvailable($items, $products);

            $subtotal = $items->sum(fn ($item) => $item->quantity * $products[$item->product_id]->price_cents);
            $shipping = $this->shipping->quote($address->zip_code, $subtotal)->priceCents;

            $order = $user->orders()->create([
                'number' => $this->generateNumber(),
                'status' => OrderStatus::Pending,
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'total_cents' => $subtotal + $shipping,
                'shipping_address' => $address->toSnapshot(),
            ]);

            foreach ($items as $item) {
                $product = $products[$item->product_id];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price_cents' => $product->price_cents,
                    'quantity' => $item->quantity,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            return $order;
        });
    }

    private function ensureAvailable($items, $products): void
    {
        $errors = [];

        foreach ($items as $item) {
            $product = $products->get($item->product_id);

            if (! $product || ! $product->is_active) {
                $errors[] = 'Um dos produtos do carrinho não está mais disponível.';
            } elseif ($product->stock < $item->quantity) {
                $errors[] = "Temos apenas {$product->stock} unidade(s) de {$product->name} em estoque.";
            }
        }

        if ($errors) {
            throw ValidationException::withMessages(['cart' => $errors]);
        }
    }

    private function generateNumber(): string
    {
        do {
            $number = 'BOH-'.Str::upper(Str::random(10));
        } while (Order::where('number', $number)->exists());

        return $number;
    }
}
