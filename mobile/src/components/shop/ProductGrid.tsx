import { View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import type { Product } from '@/features/catalog/queries';

import { ProductCard } from './ProductCard';

type GridProps = {
  columns: number;
};

function Cell({ columns, children }: GridProps & { children: React.ReactNode }) {
  return (
    <View className="p-1.5 md:p-2" style={{ width: `${100 / columns}%` }}>
      {children}
    </View>
  );
}

export function ProductGrid({ products, columns }: GridProps & { products: Product[] }) {
  return (
    <View className="-m-1.5 flex-row flex-wrap md:-m-2">
      {products.map((product) => (
        <Cell key={product.id} columns={columns}>
          <ProductCard product={product} />
        </Cell>
      ))}
    </View>
  );
}

export function ProductGridSkeleton({ columns, count }: GridProps & { count: number }) {
  return (
    <View aria-busy aria-label="Carregando produtos" className="-m-1.5 flex-row flex-wrap md:-m-2">
      {Array.from({ length: count }, (_, index) => (
        <Cell key={index} columns={columns}>
          <Card className="gap-3 p-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-9 w-full" />
          </Card>
        </Cell>
      ))}
    </View>
  );
}
