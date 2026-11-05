<?php

namespace App\Services\Shipping;

final readonly class ShippingQuote
{
    public function __construct(
        public int $priceCents,
        public int $estimatedDays,
        public string $region,
    ) {}
}
