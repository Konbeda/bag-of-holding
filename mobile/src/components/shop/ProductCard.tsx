import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, Price, Text } from '@/components/ui';
import { useCartActions } from '@/features/cart/use-cart';
import type { Product } from '@/features/catalog/queries';

import { ProductImage } from './ProductImage';

function discountOf({ price_cents: price, compare_at_price_cents: compareAt }: Product) {
  return compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, isPending } = useCartActions();
  const discount = discountOf(product);

  return (
    <Card className="flex-1 gap-3 p-3">
      <Link href={{ pathname: '/product/[slug]', params: { slug: product.slug } }} asChild>
        <Pressable role="link" aria-label={product.name} className="flex-1 gap-3 web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary">
          <View>
            <ProductImage product={product} />
            {!product.in_stock ? (
              <Badge tone="danger" className="absolute left-2 top-2">
                Esgotado
              </Badge>
            ) : (
              discount > 0 && (
                <Badge tone="accent" className="absolute left-2 top-2">
                  {`-${discount}%`}
                </Badge>
              )
            )}
          </View>
          <View className="flex-1 gap-1">
            {product.brand && (
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {product.brand.name}
              </Text>
            )}
            <Text variant="small" weight="medium" numberOfLines={2}>
              {product.name}
            </Text>
          </View>
          <Price cents={product.price_cents} compareAtCents={product.compare_at_price_cents} />
        </Pressable>
      </Link>
      <Button
        variant="secondary"
        size="sm"
        fullWidth
        disabled={!product.in_stock || isPending}
        onPress={() => add(product)}
      >
        {product.in_stock ? 'Adicionar' : 'Indisponível'}
      </Button>
    </Card>
  );
}
