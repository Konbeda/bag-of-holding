import { Link, router } from 'expo-router';
import { ShoppingBag, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { ProductImage } from '@/components/shop/ProductImage';
import { ShippingEstimator } from '@/components/shop/ShippingEstimator';
import {
  Button,
  Card,
  Container,
  D20Loader,
  Divider,
  EmptyState,
  IconButton,
  Price,
  QuantityStepper,
  showToast,
  Text,
} from '@/components/ui';
import { useSession } from '@/features/auth/session';
import { type CartLine, useCart, useCartActions } from '@/features/cart/use-cart';
import { formatBRL } from '@/lib/format';

function LineItem({ line }: { line: CartLine }) {
  const { setQuantity, remove, isPending } = useCartActions();
  const { product, quantity, lineTotalCents, isAvailable } = line;

  return (
    <View className="flex-row gap-3 md:gap-4">
      <Link href={{ pathname: '/product/[slug]', params: { slug: product.slug } }} asChild>
        <Pressable role="link" aria-label={product.name} className="w-20 md:w-28">
          <ProductImage product={product} />
        </Pressable>
      </Link>
      <View className="flex-1 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="shrink gap-1">
            <Text variant="small" weight="medium" numberOfLines={2}>
              {product.name}
            </Text>
            <Text variant="caption" tone="muted">
              {formatBRL(product.price_cents)} cada
            </Text>
          </View>
          <IconButton
            icon={Trash2}
            label={`Remover ${product.name}`}
            size="sm"
            disabled={isPending}
            onPress={() => remove(product)}
          />
        </View>
        {!isAvailable && (
          <Text role="alert" variant="small" tone="danger">
            {product.stock > 0 ? `Temos apenas ${product.stock} em estoque. Ajuste a quantidade.` : 'Produto esgotado.'}
          </Text>
        )}
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={quantity}
            max={Math.max(quantity, Math.min(product.stock, 99))}
            disabled={isPending}
            onChange={(value) => setQuantity(product, value)}
          />
          <Price cents={lineTotalCents} />
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const ready = useSession((state) => state.ready);
  const signedIn = useSession((state) => Boolean(state.user));
  const { lines, subtotalCents, isLoading, isError, refetch } = useCart();
  const canCheckout = lines.length > 0 && lines.every((line) => line.isAvailable);

  const checkout = () => {
    if (signedIn) showToast('O checkout chega na próxima etapa do projeto.');
    else router.push({ pathname: '/login', params: { redirect: '/cart' } });
  };

  let content;

  if (!ready || isLoading) {
    content = (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  } else if (isError) {
    content = <ErrorState onRetry={refetch} />;
  } else if (lines.length === 0) {
    content = (
      <EmptyState icon={ShoppingBag} title="Seu carrinho está vazio" description="Toda aventura começa com um bom equipamento.">
        <Link href="/catalog" asChild>
          <Button className="self-center">Ver catálogo</Button>
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      <View className="gap-6 md:flex-row md:items-start md:gap-8">
        <View className="gap-4 md:flex-1">
          {lines.map((line, index) => (
            <View key={line.product.id} className="gap-4">
              {index > 0 && <Divider />}
              <LineItem line={line} />
            </View>
          ))}
        </View>
        <Card className="gap-4 p-4 md:w-80">
          <Text variant="h3">Resumo</Text>
          <View className="flex-row items-center justify-between">
            <Text variant="small" tone="muted">
              Subtotal
            </Text>
            <Price cents={subtotalCents} />
          </View>
          <Divider />
          <ShippingEstimator subtotalCents={subtotalCents} />
          <Divider />
          <Button size="lg" fullWidth disabled={!canCheckout} onPress={checkout}>
            {signedIn ? 'Finalizar compra' : 'Entrar para finalizar'}
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <PageTitle title="Carrinho | Bag of Holding" />
      <Container className="gap-6 pt-4 md:pt-8">
        <Text variant="h1">Carrinho</Text>
        {content}
      </Container>
      <Footer />
    </ScrollView>
  );
}
