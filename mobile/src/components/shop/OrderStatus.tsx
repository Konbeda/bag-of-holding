import { Check } from '@/lib/icons';
import { Fragment } from 'react';
import { View } from 'react-native';

import { Badge, type BadgeTone, Text } from '@/components/ui';
import type { Order, OrderStatus } from '@/features/orders/queries';
import { cn } from '@/lib/cn';

const tones: Record<OrderStatus, BadgeTone> = {
  pending: 'warning',
  paid: 'primary',
  shipped: 'primary',
  delivered: 'success',
  canceled: 'danger',
};

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'paid', label: 'Pago' },
  { status: 'shipped', label: 'Enviado' },
  { status: 'delivered', label: 'Entregue' },
];

export function OrderStatusBadge({ order }: { order: Pick<Order, 'status' | 'status_label'> }) {
  return <Badge tone={tones[order.status]}>{order.status_label}</Badge>;
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = steps.findIndex((step) => step.status === status);

  return (
    <View className="flex-row items-start">
      {steps.map((step, index) => {
        const reached = index <= current;

        return (
          <Fragment key={step.status}>
            {index > 0 && <View className={cn('mt-3.5 h-0.5 flex-1', reached ? 'bg-primary' : 'bg-line')} />}
            <View className="w-16 items-center gap-1.5" aria-current={index === current ? 'step' : undefined}>
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full border-2',
                  reached ? 'border-primary bg-primary' : 'border-line bg-white',
                )}
              >
                {reached && <Check size={14} color="#FFFFFF" />}
              </View>
              <Text variant="caption" weight={index === current ? 'semibold' : 'regular'} tone={reached ? 'default' : 'muted'}>
                {step.label}
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}
