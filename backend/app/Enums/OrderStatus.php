<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Canceled = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Aguardando pagamento',
            self::Paid => 'Pago',
            self::Shipped => 'Enviado',
            self::Delivered => 'Entregue',
            self::Canceled => 'Cancelado',
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, match ($this) {
            self::Pending => [self::Paid, self::Canceled],
            self::Paid => [self::Shipped, self::Canceled],
            self::Shipped => [self::Delivered],
            self::Delivered, self::Canceled => [],
        }, true);
    }

    /** @return list<self> */
    public static function revenueStatuses(): array
    {
        return [self::Paid, self::Shipped, self::Delivered];
    }
}
