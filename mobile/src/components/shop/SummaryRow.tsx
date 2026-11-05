import { View } from 'react-native';

import { Text } from '@/components/ui';
import { formatBRL } from '@/lib/format';

type SummaryRowProps = {
  label: string;
  cents?: number;
  emphasized?: boolean;
};

export function SummaryRow({ label, cents, emphasized = false }: SummaryRowProps) {
  const free = cents === 0;

  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant={emphasized ? 'body' : 'small'} weight={emphasized ? 'semibold' : 'regular'} tone={emphasized ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={emphasized ? 'h3' : 'small'} weight={emphasized ? 'semibold' : 'medium'} tone={free ? 'success' : 'default'}>
        {cents === undefined ? '-' : free ? 'Grátis' : formatBRL(cents)}
      </Text>
    </View>
  );
}
