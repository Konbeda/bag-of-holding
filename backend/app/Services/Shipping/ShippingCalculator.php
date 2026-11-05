<?php

namespace App\Services\Shipping;

class ShippingCalculator
{
    public const FREE_SHIPPING_FROM_CENTS = 30000;

    // Keyed by the first CEP digit: region, price in cents, estimated days
    private const TABLE = [
        '0' => ['Grande São Paulo', 1490, 3],
        '1' => ['Interior de São Paulo', 1790, 4],
        '2' => ['Rio de Janeiro e Espírito Santo', 1990, 5],
        '3' => ['Minas Gerais', 1990, 5],
        '4' => ['Bahia e Sergipe', 2690, 7],
        '5' => ['Pernambuco, Alagoas, Paraíba e Rio Grande do Norte', 2990, 8],
        '6' => ['Norte e Ceará, Piauí e Maranhão', 3490, 10],
        '7' => ['Centro-Oeste, Tocantins e Rondônia', 2790, 7],
        '8' => ['Paraná e Santa Catarina', 2290, 5],
        '9' => ['Rio Grande do Sul', 2490, 6],
    ];

    public function quote(string $zipCode, int $subtotalCents): ShippingQuote
    {
        [$region, $price, $days] = self::TABLE[$zipCode[0]];

        return new ShippingQuote(
            $subtotalCents >= self::FREE_SHIPPING_FROM_CENTS ? 0 : $price,
            $days,
            $region,
        );
    }
}
