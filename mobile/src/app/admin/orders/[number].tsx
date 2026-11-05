import { Link, useLocalSearchParams } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AdminLoader, AdminPage } from '@/components/admin/AdminPage';
import { AddressLines } from '@/components/shop/AddressLines';
import { ErrorState } from '@/components/shop/ErrorState';
import { OrderStatusBadge, OrderTimeline } from '@/components/shop/OrderStatus';
import { OrderSummary } from '@/components/shop/OrderSummary';
import { Button, Card, EmptyState, Sheet, showToast, Text } from '@/components/ui';
import { useAdminOrder, useChangeOrderStatus } from '@/features/admin/queries';
import type { OrderStatus } from '@/features/orders/queries';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';

// Mirrors the transitions the API allows; the API still has the final word
const nextSteps: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'paid', label: 'Marcar como pago' },
  paid: { status: 'shipped', label: 'Marcar como enviado' },
  shipped: { status: 'delivered', label: 'Marcar como entregue' },
};

const cancelable: OrderStatus[] = ['pending', 'paid'];

function errorMessage(error: Error | null) {
  if (!error) return null;

  return error instanceof ApiError ? (error.errors.status?.[0] ?? error.message) : error.message;
}

export default function AdminOrderScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const { data: order, isLoading, error, refetch } = useAdminOrder(number);
  const change = useChangeOrderStatus(number);
  const [canceling, setCanceling] = useState(false);

  const closeCancel = () => {
    setCanceling(false);
    change.reset();
  };

  if (isLoading) {
    return (
      <AdminPage title="Pedido">
        <AdminLoader />
      </AdminPage>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <AdminPage title="Pedido">
        <EmptyState icon={PackageX} title="Pedido não encontrado">
          <Link href="/admin/orders" asChild>
            <Button className="self-center">Ver pedidos</Button>
          </Link>
        </EmptyState>
      </AdminPage>
    );
  }

  if (!order) {
    return (
      <AdminPage title="Pedido">
        <ErrorState onRetry={refetch} />
      </AdminPage>
    );
  }

  const next = nextSteps[order.status];
  const payment = order.payments[order.payments.length - 1];
  const failure = canceling ? null : errorMessage(change.error);

  return (
    <AdminPage title={order.number} action={<OrderStatusBadge order={order} />}>
      <Text variant="small" tone="muted">
        {`Feito em ${formatDate(order.created_at)}`}
      </Text>

      {order.status === 'canceled' ? (
        <Text variant="small" tone="secondary">
          Este pedido foi cancelado e os itens voltaram ao estoque.
        </Text>
      ) : (
        <View className="max-w-md">
          <OrderTimeline status={order.status} />
        </View>
      )}

      {(next || cancelable.includes(order.status)) && (
        <View className="gap-2">
          <View className="flex-row flex-wrap gap-3">
            {next && (
              <Button
                loading={change.isPending}
                onPress={() =>
                  change.mutate(next.status, { onSuccess: () => showToast('Status do pedido atualizado.', 'success') })
                }
              >
                {next.label}
              </Button>
            )}
            {cancelable.includes(order.status) && (
              <Button variant="secondary" disabled={change.isPending} onPress={() => setCanceling(true)}>
                Cancelar pedido
              </Button>
            )}
          </View>
          {failure && (
            <Text role="alert" variant="small" tone="danger">
              {failure}
            </Text>
          )}
        </View>
      )}

      <View className="gap-4 md:flex-row md:items-start">
        <OrderSummary order={order} className="md:flex-1" />
        <View className="gap-4 md:w-80">
          <Card className="gap-1 p-4">
            <Text variant="h3">Cliente</Text>
            <Text variant="small" weight="medium">
              {order.customer?.name ?? '-'}
            </Text>
            <Text variant="small" tone="secondary">
              {order.customer?.email ?? '-'}
            </Text>
          </Card>
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

      <Sheet visible={canceling} title="Cancelar pedido" onClose={closeCancel}>
        <View className="gap-4">
          <Text variant="small" tone="secondary">
            Os itens voltam ao estoque e, se o pedido já foi pago, o pagamento é estornado. Isso não pode ser desfeito.
          </Text>
          {canceling && change.error && (
            <Text role="alert" variant="small" tone="danger">
              {errorMessage(change.error)}
            </Text>
          )}
          <Button
            variant="danger"
            fullWidth
            loading={change.isPending}
            onPress={() =>
              change.mutate('canceled', {
                onSuccess: () => {
                  setCanceling(false);
                  showToast('Pedido cancelado.', 'success');
                },
              })
            }
          >
            Cancelar pedido
          </Button>
        </View>
      </Sheet>
    </AdminPage>
  );
}
