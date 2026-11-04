import { Link, useLocalSearchParams } from 'expo-router';
import { PackageX, ShoppingBag } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductImage } from '@/components/shop/ProductImage';
import { ShippingEstimator } from '@/components/shop/ShippingEstimator';
import {
  Badge,
  Button,
  Container,
  D20Loader,
  Divider,
  EmptyState,
  Price,
  QuantityStepper,
  Text,
} from '@/components/ui';
import { useCartActions } from '@/features/cart/use-cart';
import { type Product, useProduct, useProducts } from '@/features/catalog/queries';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useBreakpoint } from '@/lib/use-breakpoint';

const LOW_STOCK = 5;

function Gallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  return (
    <View className="gap-3">
      <ProductImage product={product} index={selected} />
      {product.images.length > 1 && (
        <View className="flex-row flex-wrap gap-2">
          {product.images.map((image, index) => (
            <Pressable
              key={image.url}
              aria-label={`Ver imagem ${index + 1}`}
              onPress={() => setSelected(index)}
              className={cn('w-16 rounded-md border-2', selected === index ? 'border-primary' : 'border-transparent')}
            >
              <ProductImage product={product} index={index} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function BuyBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { add, isPending } = useCartActions();

  return (
    <View className="gap-5">
      <View className="gap-2">
        {product.brand && (
          <Text variant="small" tone="muted">
            {product.brand.name}
          </Text>
        )}
        <Text variant="h1">{product.name}</Text>
      </View>

      <Price cents={product.price_cents} compareAtCents={product.compare_at_price_cents} size="lg" />

      {!product.in_stock ? (
        <Badge tone="danger">Esgotado</Badge>
      ) : product.stock <= LOW_STOCK ? (
        <Badge tone="warning">{product.stock === 1 ? 'Última unidade' : `Últimas ${product.stock} unidades`}</Badge>
      ) : (
        <Badge tone="success">Em estoque</Badge>
      )}

      {product.in_stock && (
        <View className="flex-row flex-wrap items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} max={Math.min(product.stock, 99)} />
          <Button
            size="lg"
            icon={ShoppingBag}
            loading={isPending}
            className="flex-1"
            onPress={() => add(product, quantity)}
          >
            Adicionar ao carrinho
          </Button>
        </View>
      )}

      <Divider />
      <ShippingEstimator subtotalCents={product.price_cents * quantity} />
    </View>
  );
}

function Related({ product, columns }: { product: Product; columns: number }) {
  const { data } = useProducts({ category: product.category?.slug, per_page: columns + 1 });
  const related = data?.filter(({ id }) => id !== product.id).slice(0, columns);

  if (!related?.length) return null;

  return (
    <View className="gap-4">
      <Text variant="h2">Você também pode gostar</Text>
      <ProductGrid products={related} columns={columns} />
    </View>
  );
}

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, error, isLoading, refetch } = useProduct(slug);
  const { isWide, isExtraWide } = useBreakpoint();
  const specifications = Object.entries(product?.specifications ?? {});

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <D20Loader />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center bg-white">
        <PageTitle title="Produto não encontrado | Bag of Holding" />
        {error instanceof ApiError && error.status === 404 ? (
          <EmptyState
            icon={PackageX}
            title="Produto não encontrado"
            description="Ele pode ter saído do catálogo. Que tal procurar outro?"
          >
            <Link href="/catalog" asChild>
              <Button className="self-center">Ver catálogo</Button>
            </Link>
          </EmptyState>
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <PageTitle title={`${product.name} | Bag of Holding`} />
      <Container className="gap-10 pt-4 md:pt-8">
        <View className="gap-6 md:flex-row md:gap-12">
          <View className="md:w-1/2 lg:w-5/12">
            <Gallery product={product} />
          </View>
          <View className="md:flex-1">
            <BuyBox key={product.id} product={product} />
          </View>
        </View>

        <View className="gap-8 md:flex-row md:gap-12">
          <View className="gap-3 md:flex-1">
            <Text variant="h2">Descrição</Text>
            <Text tone="secondary">{product.description}</Text>
          </View>
          {specifications.length > 0 && (
            <View className="gap-3 md:flex-1">
              <Text variant="h2">Especificações</Text>
              <View className="rounded-lg border border-line">
                {specifications.map(([name, value], index) => (
                  <View
                    key={name}
                    className={cn('flex-row justify-between gap-4 p-3', index > 0 && 'border-t border-line')}
                  >
                    <Text variant="small" tone="muted">
                      {name}
                    </Text>
                    <Text variant="small" weight="medium" className="shrink text-right">
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Related product={product} columns={isExtraWide ? 4 : isWide ? 3 : 2} />
      </Container>
      <Footer />
    </ScrollView>
  );
}
