<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Approved = 'approved';
    case Declined = 'declined';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Approved => 'Aprovado',
            self::Declined => 'Recusado',
            self::Refunded => 'Estornado',
        };
    }
}
