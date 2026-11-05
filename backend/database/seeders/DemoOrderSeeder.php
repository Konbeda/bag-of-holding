<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Shipping\ShippingCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Random\Engine\Mt19937;
use Random\Randomizer;

class DemoOrderSeeder extends Seeder
{
    private const DAYS = 30;

    private const NUMBER_PREFIX = 'BOH-DEMO';

    // Each row: name, CEP, street, district, city, state
    private const CUSTOMERS = [
        ['Marina Duarte', '04567000', 'Rua das Acácias', 'Brooklin', 'São Paulo', 'SP'],
        ['Rafael Nogueira', '20040002', 'Rua do Ouvidor', 'Centro', 'Rio de Janeiro', 'RJ'],
        ['Helena Prado', '30130110', 'Rua dos Timbiras', 'Funcionários', 'Belo Horizonte', 'MG'],
        ['Tiago Moreira', '80010000', 'Rua das Flores', 'Centro', 'Curitiba', 'PR'],
        ['Bianca Rocha', '90010000', 'Rua dos Andradas', 'Centro Histórico', 'Porto Alegre', 'RS'],
        ['Caio Barros', '40020000', 'Rua Chile', 'Centro', 'Salvador', 'BA'],
    ];

    public function run(ShippingCalculator $shipping): void
    {
        if (Order::where('number', 'like', self::NUMBER_PREFIX.'%')->exists()) {
            return;
        }

        // A fixed seed keeps the demo identical on every reset
        $random = new Randomizer(new Mt19937(2026));
        $products = Product::active()->orderBy('id')->get();
        $customers = $this->customers();
        $sequence = 0;

        for ($age = self::DAYS - 1; $age >= 0; $age--) {
            for ($count = $random->getInt(0, 3); $count > 0; $count--) {
                $this->createOrder(++$sequence, $age, $customers->get($random->getInt(0, $customers->count() - 1)), $products, $random, $shipping);
            }
        }
    }

    /** @return Collection<int, array{user: User, address: array<string, string|null>}> */
    private function customers(): Collection
    {
        $accounts = collect(self::CUSTOMERS)->map(function (array $row) {
            [$name, $zipCode, $street, $district, $city, $state] = $row;

            $user = User::firstOrNew(['email' => Str::slug($name, '.').'@exemplo.test']);
            // These accounts only own orders, so nobody can sign in with them
            $user->forceFill(['name' => $name, 'password' => Str::random(40), 'role' => UserRole::Customer])->save();

            return ['user' => $user, 'address' => [
                'recipient' => $name,
                'zip_code' => $zipCode,
                'street' => $street,
                'number' => '100',
                'complement' => null,
                'district' => $district,
                'city' => $city,
                'state' => $state,
            ]];
        });

        $demo = User::where('email', 'cliente@bagofholding.test')->first();

        return $demo
            ? $accounts->push(['user' => $demo, 'address' => $demo->addresses()->first()->toSnapshot()])
            : $accounts;
    }

    /** @param array{user: User, address: array<string, string|null>} $customer */
    private function createOrder(int $sequence, int $age, array $customer, Collection $products, Randomizer $random, ShippingCalculator $shipping): void
    {
        $status = $this->statusFor($age, $random);
        $placedAt = $age === 0 ? now()->subMinutes($random->getInt(5, 300)) : now()->subDays($age)->setTime($random->getInt(9, 22), $random->getInt(0, 59));

        $lines = collect($random->pickArrayKeys($products->all(), $random->getInt(1, 3)))
            ->map(fn (int $key) => [$products[$key], $random->getInt(1, 2)]);

        $subtotal = $lines->sum(fn (array $line) => $line[0]->price_cents * $line[1]);
        $shippingCents = $shipping->quote($customer['address']['zip_code'], $subtotal)->priceCents;

        $order = $customer['user']->orders()->create([
            'number' => self::NUMBER_PREFIX.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT),
            'status' => $status,
            'subtotal_cents' => $subtotal,
            'shipping_cents' => $shippingCents,
            'total_cents' => $subtotal + $shippingCents,
            'shipping_address' => $customer['address'],
        ]);

        foreach ($lines as [$product, $quantity]) {
            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price_cents' => $product->price_cents,
                'quantity' => $quantity,
            ]);
        }

        $order->payments()->create([
            'method' => $random->getInt(0, 1) ? PaymentMethod::Pix : PaymentMethod::Card,
            'status' => $status === OrderStatus::Canceled ? PaymentStatus::Declined : PaymentStatus::Approved,
            'amount_cents' => $order->total_cents,
            'provider_reference' => $status === OrderStatus::Canceled ? null : 'demo_'.$sequence,
        ]);

        $this->backdate($order, $placedAt);
    }

    private function statusFor(int $age, Randomizer $random): OrderStatus
    {
        return match (true) {
            $random->getInt(1, 12) === 1 => OrderStatus::Canceled,
            $age <= 2 => OrderStatus::Paid,
            $age <= 8 => OrderStatus::Shipped,
            default => OrderStatus::Delivered,
        };
    }

    private function backdate(Order $order, Carbon $placedAt): void
    {
        $order->forceFill(['created_at' => $placedAt, 'updated_at' => $placedAt])->saveQuietly();
    }
}
