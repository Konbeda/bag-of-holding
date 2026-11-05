import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import type { DailySales } from '@/features/admin/queries';
import { cn } from '@/lib/cn';
import { formatBRL } from '@/lib/format';

const DAYS = 30;
const DAY_MS = 86_400_000;

// The API only returns days with sales and groups them in UTC, so the gaps are filled using UTC dates too
function fillDays(sales: DailySales[]): DailySales[] {
  const byDate = new Map(sales.map((day) => [day.date, day]));
  const now = Date.now();

  return Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(now - (DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10);

    return byDate.get(date) ?? { date, orders: 0, revenue_cents: 0 };
  });
}

function shortDate(date: string) {
  const [, month, day] = date.split('-');

  return `${day}/${month}`;
}

function describe({ date, orders, revenue_cents: revenue }: DailySales) {
  const count = orders === 1 ? '1 pedido' : `${orders} pedidos`;

  return `${shortDate(date)}: ${formatBRL(revenue)}, ${count}`;
}

export function SalesChart({ sales }: { sales: DailySales[] }) {
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [asTable, setAsTable] = useState(false);

  const days = fillDays(sales);
  const withSales = days.filter((day) => day.orders > 0);
  const max = Math.max(...days.map((day) => day.revenue_cents), 1);
  const total = days.reduce((sum, day) => sum + day.revenue_cents, 0);
  const active = days.find((day) => day.date === activeDate);

  return (
    <Card className="gap-4 p-4">
      <View className="flex-row flex-wrap items-start justify-between gap-2">
        <View className="gap-0.5">
          <Text variant="h3">Vendas nos últimos 30 dias</Text>
          <Text aria-live="polite" variant="small" tone="muted">
            {active ? describe(active) : `${formatBRL(total)} no período`}
          </Text>
        </View>
        <Button variant="ghost" size="sm" onPress={() => setAsTable(!asTable)}>
          {asTable ? 'Ver gráfico' : 'Ver tabela'}
        </Button>
      </View>

      {asTable ? (
        <View className="gap-2">
          {withSales.length === 0 && (
            <Text variant="small" tone="muted">
              Nenhuma venda no período.
            </Text>
          )}
          {withSales.map((day) => (
            <View key={day.date} className="flex-row justify-between gap-3">
              <Text variant="small" tone="secondary">
                {`${shortDate(day.date)} · ${day.orders === 1 ? '1 pedido' : `${day.orders} pedidos`}`}
              </Text>
              <Text variant="small" weight="medium">
                {formatBRL(day.revenue_cents)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-1.5">
          <Text variant="caption" tone="muted">
            {`Máximo: ${formatBRL(max === 1 ? 0 : max)}`}
          </Text>
          <View className="h-40 flex-row items-end gap-0.5 border-b border-line">
            {days.map((day) => (
              <Pressable
                key={day.date}
                aria-label={describe(day)}
                onHoverIn={() => setActiveDate(day.date)}
                onHoverOut={() => setActiveDate(null)}
                onFocus={() => setActiveDate(day.date)}
                onBlur={() => setActiveDate(null)}
                onPress={() => setActiveDate(day.date)}
                className="h-full flex-1 justify-end web:outline-none web:focus-visible:bg-surface"
              >
                {day.revenue_cents > 0 && (
                  <View
                    className={cn('w-full rounded-t', day.date === activeDate ? 'bg-primary' : 'bg-primary-chart')}
                    style={{ height: `${Math.max((day.revenue_cents / max) * 100, 2)}%` }}
                  />
                )}
              </Pressable>
            ))}
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" tone="muted">
              {shortDate(days[0].date)}
            </Text>
            <Text variant="caption" tone="muted">
              {shortDate(days[DAYS - 1].date)}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}
