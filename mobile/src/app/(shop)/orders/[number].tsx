import { Link, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, PackageX } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { AddressLines } from '@/components/shop/AddressLines';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { OrderStatusBadge, OrderTimeline } from '@/components/shop/OrderStatus';
import { PageTitle } from '@/components/shop/PageTitle';
import { RequireAuth } from '@/components/shop/RequireAuth';
import { SummaryRow } from '@/components/shop/SummaryRow';
import { Button, Card, Container, D20Loader, Divider, EmptyState, Text } from '@/components/ui';
import { useOrder } from '@/features/orders/queries';
import { ApiError } from '@/lib/api';
import { formatBRL, formatDate } from '@/lib/format';
import { colors } from '@/theme';

function OrderDetail({ number, placed }: { number: string; placed: boolean }) {
  const { data: order, isLoading, error, refetch } = useOrder(number);

  if (isLoading) {
    return (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  }

  // Someone else's order answers 403, and it should look just like one that does not exist
  if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
    return (
      <EmptyState icon={PackageX} title="Pedido não encontrado" description="Confira o número ou veja a sua lista de pedidos.">
        <Link href="/orders" asChild>
          <Button className="self-center">Meus pedidos</Button>
        </Link>
      </EmptyState>
    );
  }

  if (!order) return <ErrorState onRetry={refetch} />;

  const payment = order.payments[order.payments.length - 1];

  return (
    <View className="gap-6">
      {placed && (
        <View role="status" className="flex-row items-center gap-3 rounded-lg bg-success-soft p-4">
          <CheckCircle2 size={22} color={colors.success.DEFAULT} />
          <View className="flex-1 gap-0.5">
            <Text variant="small" weight="semibold">
              Pedido confirmado!
            </Text>
            <Text variant="small" tone="secondary">
              Pagamento aprovado. Agora é só aguardar o envio.
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <View className="gap-1">
          <Text variant="h2">{order.number}</Text>
          <Text variant="small" tone="muted">
            {`Feito em ${formatDate(order.created_at)}`}
          </Text>
        </View>
        <OrderStatusBadge order={order} />
      </View>

      {order.status === 'canceled' ? (
        <Text variant="small" tone="secondary">
          Este pedido foi cancelado e os itens voltaram ao estoque.
        </Text>
      ) : (
        <View className="max-w-md">
          <OrderTimeline status={order.status} />
        </View>
      )}

      <View className="gap-6 md:flex-row md:items-start">
        <Card className="gap-3 p-4 md:flex-1">
          <Text variant="h3">Itens</Text>
          {order.items.map((item) => (
            <View key={item.product_id} className="flex-row justify-between gap-3">
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

        <View className="gap-6 md:w-80">
          <Card className="gap-3 p-4">
            <Text variant="h3">Entrega</Text>
            <AddressLines address={order.shipping_address} />
          </Card>
          {payment && (
            <Card className="gap-1 p-4">
              <Text variant="h3">Pagamento</Text>
              <Text variant="small" tone="secondary">
                {`${payment.method_label}: ${payment.status_label.toLowerCase()}`}
              </Text>
            </Card>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Link href="/orders" asChild>
          <Button variant="secondary">Meus pedidos</Button>
        </Link>
        <Link href="/catalog" asChild>
          <Button variant="ghost">Continuar comprando</Button>
        </Link>
      </View>
    </View>
  );
}

export default function OrderScreen() {
  const { number, placed } = useLocalSearchParams<{ number: string; placed?: string }>();

  return (
    <ScrollView className="flex-1 bg-white">
      <PageTitle title={`Pedido ${number} | Bag of Holding`} />
      <Container className="gap-6 pt-4 md:pt-8">
        <RequireAuth>
          <OrderDetail number={number} placed={placed === '1'} />
        </RequireAuth>
      </Container>
      <Footer />
    </ScrollView>
  );
}
