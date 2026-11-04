import { View } from 'react-native';

import { formatBRL } from '@/lib/format';

import { Text } from './Text';

const sizes = {
  sm: { price: 'small', compare: 'caption' },
  md: { price: 'body', compare: 'small' },
  lg: { price: 'h2', compare: 'body' },
} as const;

type PriceProps = {
  cents: number;
  compareAtCents?: number | null;
  size?: keyof typeof sizes;
};

export function Price({ cents, compareAtCents, size = 'md' }: PriceProps) {
  const onSale = compareAtCents != null && compareAtCents > cents;

  return (
    <View
      accessible
      aria-label={onSale ? `De ${formatBRL(compareAtCents)} por ${formatBRL(cents)}` : formatBRL(cents)}
      className="flex-row flex-wrap items-baseline gap-x-2"
    >
      <Text role="none" variant={sizes[size].price} weight="semibold">
        {formatBRL(cents)}
      </Text>
      {onSale && (
        <Text variant={sizes[size].compare} tone="muted" className="line-through">
          {formatBRL(compareAtCents)}
        </Text>
      )}
    </View>
  );
}
