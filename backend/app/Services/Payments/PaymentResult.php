<?php

namespace App\Services\Payments;

use App\Enums\PaymentStatus;

final readonly class PaymentResult
{
    public function __construct(
        public PaymentStatus $status,
        public ?string $reference = null,
    ) {}
}
