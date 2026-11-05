import { Link, router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, ClipboardList } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AdminLoader, AdminPage } from '@/components/admin/AdminPage';
import { ErrorState } from '@/components/shop/ErrorState';
import { OrderStatusBadge } from '@/components/shop/OrderStatus';
import { Button, Chip, EmptyState, Text } from '@/components/ui';
import { type AdminOrder, useAdminOrders } from '@/features/admin/queries';
import { formatBRL, formatDate } from '@/lib/format';
import { colors } from '@/theme';

const filters = [
  { value: undefined, label: 'Todos' },
  { value: 'paid', label: 'Pagos' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'pending', label: 'Aguardando pagamento' },
  { value: 'canceled', label: 'Cancelados' },
];

function OrderRow({ order }: { order: AdminOrder }) {
  return (
    <Link href={{ pathname: '/admin/orders/[number]', params: { number: order.number } }} asChild>
      <Pressable
        role="link"
        aria-label={`Pedido ${order.number}, ${order.status_label}`}
        className="flex-row items-center gap-3 rounded-lg border border-line bg-white p-4 hover:bg-surface active:bg-surface web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary"
      >
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="small" weight="semibold">
              {order.number}
            </Text>
            <OrderStatusBadge order={order} />
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="small" tone="muted" numberOfLines={1} className="shrink">
              {`${order.customer?.name ?? '-'} · ${formatDate(order.created_at)}`}
            </Text>
            <Text variant="small" weight="medium">
              {formatBRL(order.total_cents)}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.ink.muted} />
      </Pressable>
    </Link>
  );
}

export default function AdminOrdersScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const query = useAdminOrders(status);
  const orders = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <AdminPage title="Pedidos">
      <View className="flex-row flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <Chip key={label} selected={status === value} onPress={() => router.setParams({ status: value })}>
            {label}
          </Chip>
        ))}
      </View>

      {query.isLoading && <AdminLoader />}
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {query.isSuccess && orders.length === 0 && (
        <EmptyState icon={ClipboardList} title="Nenhum pedido encontrado" description="Tente outro status." />
      )}

      <View className="gap-2">
        {orders.map((order) => (
          <OrderRow key={order.number} order={order} />
        ))}
      </View>

      {query.hasNextPage && (
        <Button variant="secondary" className="self-center" loading={query.isFetchingNextPage} onPress={() => query.fetchNextPage()}>
          Carregar mais
        </Button>
      )}
    </AdminPage>
  );
}
