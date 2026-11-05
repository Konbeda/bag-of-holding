import { View } from 'react-native';

import { Card, Divider, Text } from '@/components/ui';
import type { Order } from '@/features/orders/queries';
import { formatBRL } from '@/lib/format';

import { SummaryRow } from './SummaryRow';

export function OrderSummary({ order, className }: { order: Order; className?: string }) {
  return (
    <Card className={`gap-3 p-4 ${className ?? ''}`}>
      <Text variant="h3">Itens</Text>
      {order.items.map((item) => (
        <View key={`${item.product_id}-${item.product_name}`} className="flex-row justify-between gap-3">
          <View className="shrink gap-0.5">
            <Text variant="small" weight="medium">
              {item.product_name}
            </Text>
            <Text variant="caption" tone="muted">
              {`${item.quantity}x ${formatBRL(item.unit_price_cents)}`}
            </Text>
          </View>
          <Text variant="small">{formatBRL(item.line_total_cents)}</Text>
        </View>
      ))}
      <Divider />
      <SummaryRow label="Subtotal" cents={order.subtotal_cents} />
      <SummaryRow label="Frete" cents={order.shipping_cents} />
      <Divider />
      <SummaryRow label="Total" cents={order.total_cents} emphasized />
    </Card>
  );
}
