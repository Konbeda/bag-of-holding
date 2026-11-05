import { Link } from 'expo-router';
import { ChevronRight, Package } from '@/lib/icons';
import { Pressable, ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { OrderStatusBadge } from '@/components/shop/OrderStatus';
import { PageTitle } from '@/components/shop/PageTitle';
import { RequireAuth } from '@/components/shop/RequireAuth';
import { Button, D20Loader, EmptyState, Container, Text } from '@/components/ui';
import { type Order, useInfiniteOrders } from '@/features/orders/queries';
import { formatBRL, formatDate } from '@/lib/format';
import { colors } from '@/theme';

function OrderRow({ order }: { order: Order }) {
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={{ pathname: '/orders/[number]', params: { number: order.number } }} asChild>
      <Pressable
        role="link"
        aria-label={`Pedido ${order.number}, ${order.status_label}`}
        className="flex-row items-center gap-3 rounded-lg border border-line bg-white p-4 hover:bg-surface active:bg-surface web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary"
      >
        <View className="flex-1 gap-2">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="small" weight="semibold">
              {order.number}
            </Text>
            <OrderStatusBadge order={order} />
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="small" tone="muted">
              {`${formatDate(order.created_at)} · ${units} ${units === 1 ? 'item' : 'itens'}`}
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

function OrderHistory() {
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteOrders();
  const orders = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  if (orders.length === 0) {
    return (
      <EmptyState icon={Package} title="Nenhum pedido ainda" description="Os seus pedidos aparecem aqui depois da primeira compra.">
        <Link href="/catalog" asChild>
          <Button className="self-center">Ver catálogo</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <View className="gap-3">
      {orders.map((order) => (
        <OrderRow key={order.number} order={order} />
      ))}
      {hasNextPage && (
        <Button variant="secondary" className="self-center" loading={isFetchingNextPage} onPress={() => fetchNextPage()}>
          Carregar mais
        </Button>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <PageTitle title="Meus pedidos | Bag of Holding" />
      <Container className="gap-6 pt-4 md:pt-8">
        <Text variant="h1">Meus pedidos</Text>
        <RequireAuth>
          <OrderHistory />
        </RequireAuth>
      </Container>
      <Footer />
    </ScrollView>
  );
}
