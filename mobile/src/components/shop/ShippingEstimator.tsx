import { useState } from 'react';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { useShippingQuote } from '@/features/catalog/queries';
import { fieldError } from '@/lib/api';
import { formatBRL, formatZipCode } from '@/lib/format';

export function ShippingEstimator({ subtotalCents }: { subtotalCents: number }) {
  const [zipCode, setZipCode] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const { data: quote, error, isFetching } = useShippingQuote(submitted, subtotalCents);

  const calculate = () => setSubmitted(zipCode);

  return (
    <View className="gap-2">
      <View className="flex-row items-start gap-2">
        <Input
          label="Calcular frete"
          placeholder="00000-000"
          keyboardType="number-pad"
          autoComplete="postal-code"
          value={zipCode}
          onChangeText={(value) => setZipCode(formatZipCode(value))}
          onSubmitEditing={calculate}
          error={error ? (fieldError(error, 'zip_code') ?? error.message) : undefined}
          className="flex-1"
        />
        <Button variant="secondary" loading={isFetching} onPress={calculate} className="mt-[26px]">
          Calcular
        </Button>
      </View>
      {quote && !error && (
        <Text aria-live="polite" variant="small" tone="secondary">
          {quote.region}:{' '}
          <Text variant="small" weight="semibold" tone={quote.price_cents === 0 ? 'success' : 'default'}>
            {quote.price_cents === 0 ? 'frete grátis' : formatBRL(quote.price_cents)}
          </Text>
          {`, em até ${quote.estimated_days} dias úteis.`}
        </Text>
      )}
    </View>
  );
}
