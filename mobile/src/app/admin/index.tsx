import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AdminLoader, AdminPage } from '@/components/admin/AdminPage';
import { SalesChart } from '@/components/admin/SalesChart';
import { ErrorState } from '@/components/shop/ErrorState';
import { Badge, Card, Text } from '@/components/ui';
import { useDashboard } from '@/features/admin/queries';
import { formatBRL } from '@/lib/format';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="min-w-52 flex-1 gap-1 p-4">
      <Text variant="small" tone="muted">
        {label}
      </Text>
      <Text variant="h2">{value}</Text>
      {hint && (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      )}
    </Card>
  );
}

export default function DashboardScreen() {
  const { data, isLoading, refetch } = useDashboard();

  if (isLoading) {
    return (
      <AdminPage title="Painel">
        <AdminLoader />
      </AdminPage>
    );
  }

  if (!data) {
    return (
      <AdminPage title="Painel">
        <ErrorState onRetry={refetch} />
      </AdminPage>
    );
  }

  const average = data.revenue_orders_count > 0 ? Math.round(data.revenue_cents / data.revenue_orders_count) : 0;
  const toShip = data.orders_by_status.paid ?? 0;
  const topUnits = Math.max(...data.top_products.map((product) => product.units), 1);

  return (
    <AdminPage title="Painel">
      <View className="flex-row flex-wrap gap-4">
        <Stat label="Receita" value={formatBRL(data.revenue_cents)} hint="Pedidos pagos, enviados e entregues" />
        <Stat label="Pedidos com receita" value={String(data.revenue_orders_count)} />
        <Stat label="Ticket médio" value={formatBRL(average)} />
        <Stat label="A enviar" value={String(toShip)} hint="Pedidos pagos" />
      </View>

      <SalesChart sales={data.sales_last_30_days} />

      <View className="gap-4 md:flex-row md:items-start">
        <Card className="gap-3 p-4 md:flex-1">
          <Text variant="h3">Mais vendidos</Text>
          {data.top_products.length === 0 && (
            <Text variant="small" tone="muted">
              Nenhuma venda ainda.
            </Text>
          )}
          {data.top_products.map((product) => (
            <View key={product.product_name} className="gap-1">
              <View className="flex-row justify-between gap-3">
                <Text variant="small" numberOfLines={1} className="shrink">
                  {product.product_name}
                </Text>
                <Text variant="small" weight="medium">
                  {`${product.units} un.`}
                </Text>
              </View>
              <View className="h-1 rounded-full bg-line">
                <View className="h-1 rounded-full bg-primary-chart" style={{ width: `${(product.units / topUnits) * 100}%` }} />
              </View>
            </View>
          ))}
        </Card>

        <Card className="gap-1 p-4 md:flex-1">
          <Text variant="h3" className="mb-2">
            Estoque baixo
          </Text>
          {data.low_stock.length === 0 && (
            <Text variant="small" tone="muted">
              Nenhum produto com estoque baixo.
            </Text>
          )}
          {data.low_stock.map((product) => (
            <Link key={product.id} href={{ pathname: '/admin/products/[id]', params: { id: product.id } }} asChild>
              <Pressable
                role="link"
                className="min-h-10 flex-row items-center justify-between gap-3 rounded-md px-1 hover:bg-surface active:bg-surface"
              >
                <Text variant="small" numberOfLines={1} className="shrink">
                  {product.name}
                </Text>
                <Badge tone={product.stock === 0 ? 'danger' : 'warning'} className="self-center">
                  {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
                </Badge>
              </Pressable>
            </Link>
          ))}
        </Card>
      </View>
    </AdminPage>
  );
}
