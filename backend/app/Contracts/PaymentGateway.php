<?php

namespace App\Contracts;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Services\Payments\PaymentResult;

interface PaymentGateway
{
    /** @param array<string, mixed> $context */
    public function charge(Order $order, PaymentMethod $method, array $context = []): PaymentResult;
}
