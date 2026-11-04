import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Chip, Text } from '@/components/ui';
import { useBrands, useCategories } from '@/features/catalog/queries';

export type CatalogParams = {
  q?: string;
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  sort?: string;
};

const priceRanges = [
  { label: 'Até R$ 50', min: undefined, max: '5000' },
  { label: 'R$ 50 a R$ 150', min: '5000', max: '15000' },
  { label: 'R$ 150 a R$ 300', min: '15000', max: '30000' },
  { label: 'Acima de R$ 300', min: '30000', max: undefined },
];

export function countActiveFilters({ category, brand, min_price, max_price, in_stock }: CatalogParams) {
  return [category, brand, min_price || max_price, in_stock].filter(Boolean).length;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text variant="small" weight="semibold">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

type CatalogFiltersProps = {
  params: CatalogParams;
  onChange: (changes: Partial<CatalogParams>) => void;
};

export function CatalogFilters({ params, onChange }: CatalogFiltersProps) {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  return (
    <View className="gap-6">
      <Group title="Categoria">
        {categories.map(({ slug, name }) => (
          <Chip
            key={slug}
            selected={params.category === slug}
            onPress={() => onChange({ category: params.category === slug ? undefined : slug })}
          >
            {name}
          </Chip>
        ))}
      </Group>
      <Group title="Marca">
        {brands.map(({ slug, name }) => (
          <Chip
            key={slug}
            selected={params.brand === slug}
            onPress={() => onChange({ brand: params.brand === slug ? undefined : slug })}
          >
            {name}
          </Chip>
        ))}
      </Group>
      <Group title="Preço">
        {priceRanges.map(({ label, min, max }) => {
          const selected = params.min_price === min && params.max_price === max;

          return (
            <Chip
              key={label}
              selected={selected}
              onPress={() => onChange(selected ? { min_price: undefined, max_price: undefined } : { min_price: min, max_price: max })}
            >
              {label}
            </Chip>
          );
        })}
      </Group>
      <Group title="Disponibilidade">
        <Chip
          selected={params.in_stock === '1'}
          onPress={() => onChange({ in_stock: params.in_stock === '1' ? undefined : '1' })}
        >
          Só em estoque
        </Chip>
      </Group>
      {countActiveFilters(params) > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onPress={() =>
            onChange({
              category: undefined,
              brand: undefined,
              min_price: undefined,
              max_price: undefined,
              in_stock: undefined,
            })
          }
        >
          Limpar filtros
        </Button>
      )}
    </View>
  );
}
