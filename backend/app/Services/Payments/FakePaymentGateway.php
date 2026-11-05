<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Support\Str;

class FakePaymentGateway implements PaymentGateway
{
    public const OUTCOMES = ['approved', 'declined'];

    public function charge(Order $order, PaymentMethod $method, array $context = []): PaymentResult
    {
        return ($context['simulated_outcome'] ?? 'approved') === 'approved'
            ? new PaymentResult(PaymentStatus::Approved, 'fake_'.Str::lower(Str::random(16)))
            : new PaymentResult(PaymentStatus::Declined);
    }
}
