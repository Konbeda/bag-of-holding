import { Link, Redirect, router } from 'expo-router';
import { Plus } from '@/lib/icons';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AddressForm } from '@/components/shop/AddressForm';
import { ErrorState } from '@/components/shop/ErrorState';
import { PageTitle } from '@/components/shop/PageTitle';
import { RequireAuth } from '@/components/shop/RequireAuth';
import { SummaryRow } from '@/components/shop/SummaryRow';
import { Button, Card, Container, D20Loader, Divider, RadioOption, Sheet, Text } from '@/components/ui';
import { useAddresses } from '@/features/addresses/queries';
import { useCart } from '@/features/cart/use-cart';
import { useShippingQuote } from '@/features/catalog/queries';
import { type PaymentMethod, type PaymentOutcome, usePlaceOrder } from '@/features/orders/queries';
import { ApiError } from '@/lib/api';
import { formatBRL } from '@/lib/format';

function errorMessages(error: Error | null): string[] {
  if (!error) return [];

  const messages = error instanceof ApiError ? Object.values(error.errors).flat() : [];

  return messages.length > 0 ? messages : [error.message];
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text variant="h3">{title}</Text>
        {description && (
          <Text variant="small" tone="muted">
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function CheckoutFlow() {
  const cart = useCart();
  const addresses = useAddresses();
  const place = usePlaceOrder();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [outcome, setOutcome] = useState<PaymentOutcome>('approved');

  const list = addresses.data ?? [];
  const selected = list.find((address) => address.id === selectedId) ?? list[0];
  const quote = useShippingQuote(selected?.zip_code ?? null, cart.subtotalCents);
  const allAvailable = cart.lines.every((line) => line.isAvailable);

  // After a successful order the cart empties while the screen is still navigating away
  if (cart.isLoading || addresses.isLoading || place.isSuccess) {
    return (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  }

  if (cart.isError || addresses.isError) {
    return <ErrorState onRetry={() => (cart.isError ? cart.refetch() : addresses.refetch())} />;
  }

  if (cart.lines.length === 0) return <Redirect href="/cart" />;

  const pay = () => {
    if (!selected) return;

    place.mutate(
      { address_id: selected.id, payment_method: method, simulated_outcome: outcome },
      {
        onSuccess: ({ data }) =>
          router.replace({ pathname: '/orders/[number]', params: { number: data.number, placed: '1' } }),
      },
    );
  };

  return (
    <View className="gap-8 md:flex-row md:items-start">
      <View className="gap-8 md:flex-1">
        <Section title="Endereço de entrega">
          {list.length === 0 ? (
            <Card className="p-4">
              <AddressForm submitLabel="Salvar e continuar" onSaved={(address) => setSelectedId(address.id)} />
            </Card>
          ) : (
            <>
              <View role="radiogroup" aria-label="Endereço de entrega" className="gap-2">
                {list.map((address) => (
                  <RadioOption
                    key={address.id}
                    label={`${address.street}, ${address.number}`}
                    description={`${address.district}, ${address.city} - ${address.state}`}
                    selected={address.id === selected?.id}
                    onPress={() => setSelectedId(address.id)}
                  />
                ))}
              </View>
              <Button variant="secondary" size="sm" icon={Plus} onPress={() => setAddingAddress(true)}>
                Novo endereço
              </Button>
              <Sheet visible={addingAddress} title="Novo endereço" onClose={() => setAddingAddress(false)}>
                <AddressForm
                  submitLabel="Salvar e usar este endereço"
                  onSaved={(address) => {
                    setSelectedId(address.id);
                    setAddingAddress(false);
                  }}
                />
              </Sheet>
            </>
          )}
        </Section>

        <Section title="Forma de pagamento">
          <View role="radiogroup" aria-label="Forma de pagamento" className="gap-2">
            <RadioOption
              label="Pix"
              description="Confirmação na hora."
              selected={method === 'pix'}
              onPress={() => setMethod('pix')}
            />
            <RadioOption
              label="Cartão de crédito"
              description="Nenhum dado de cartão é pedido nesta demonstração."
              selected={method === 'card'}
              onPress={() => setMethod('card')}
            />
          </View>
        </Section>

        <Section
          title="Resultado do pagamento"
          description="Esta loja é uma demonstração: nenhuma cobrança é feita, e você escolhe o que acontece."
        >
          <View role="radiogroup" aria-label="Resultado do pagamento" className="gap-2">
            <RadioOption label="Aprovar pagamento" selected={outcome === 'approved'} onPress={() => setOutcome('approved')} />
            <RadioOption label="Recusar pagamento" selected={outcome === 'declined'} onPress={() => setOutcome('declined')} />
          </View>
        </Section>
      </View>

      <Card className="gap-4 p-4 md:w-96">
        <Text variant="h3">Resumo</Text>
        <View className="gap-2">
          {cart.lines.map(({ product, quantity, lineTotalCents }) => (
            <View key={product.id} className="flex-row justify-between gap-3">
              <Text variant="small" tone="secondary" className="shrink">
                {`${quantity}x ${product.name}`}
              </Text>
              <Text variant="small">{formatBRL(lineTotalCents)}</Text>
            </View>
          ))}
        </View>
        <Divider />
        <SummaryRow label="Subtotal" cents={cart.subtotalCents} />
        <SummaryRow label="Frete" cents={quote.data?.price_cents} />
        {quote.data && (
          <Text variant="caption" tone="muted">
            {`${quote.data.region}: em até ${quote.data.estimated_days} dias úteis.`}
          </Text>
        )}
        {quote.isError && (
          <Text role="alert" variant="small" tone="danger">
            Não foi possível calcular o frete para este endereço.
          </Text>
        )}
        <Divider />
        <SummaryRow
          label="Total"
          cents={quote.data ? cart.subtotalCents + quote.data.price_cents : undefined}
          emphasized
        />
        {!allAvailable && (
          <View className="gap-1">
            <Text role="alert" variant="small" tone="danger">
              O estoque de algum item mudou.
            </Text>
            <Link href="/cart">
              <Text variant="small" weight="medium" tone="primary">
                Ajustar carrinho
              </Text>
            </Link>
          </View>
        )}
        {errorMessages(place.error).map((message) => (
          <Text key={message} role="alert" variant="small" tone="danger">
            {message}
          </Text>
        ))}
        <Button
          size="lg"
          fullWidth
          disabled={!selected || !quote.data || !allAvailable}
          loading={place.isPending}
          onPress={pay}
        >
          {quote.data ? `Pagar ${formatBRL(cart.subtotalCents + quote.data.price_cents)}` : 'Pagar'}
        </Button>
      </Card>
    </View>
  );
}

export default function CheckoutScreen() {
  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <PageTitle title="Finalizar compra | Bag of Holding" />
      <Container className="gap-6 pb-10 pt-4 md:pt-8">
        <Text variant="h1">Finalizar compra</Text>
        <RequireAuth>
          <CheckoutFlow />
        </RequireAuth>
      </Container>
    </ScrollView>
  );
}
