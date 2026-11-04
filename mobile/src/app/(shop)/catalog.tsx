import { router, useLocalSearchParams } from 'expo-router';
import { PackageSearch, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { CatalogFilters, type CatalogParams, countActiveFilters } from '@/components/shop/CatalogFilters';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { ProductGrid, ProductGridSkeleton } from '@/components/shop/ProductGrid';
import { SearchField } from '@/components/shop/SearchField';
import { Button, Container, EmptyState, Select, Sheet, Text } from '@/components/ui';
import { useCategories, useInfiniteProducts } from '@/features/catalog/queries';
import { useBreakpoint } from '@/lib/use-breakpoint';

const PAGE_SIZE = 12;

const sortOptions = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome' },
];

export default function CatalogScreen() {
  const params = useLocalSearchParams<CatalogParams>();
  const { isWide, isExtraWide } = useBreakpoint();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: categories } = useCategories();

  const { q, category, brand, min_price, max_price, in_stock, sort } = params;
  const query = useInfiniteProducts({ q, category, brand, min_price, max_price, in_stock, sort, per_page: PAGE_SIZE });

  const products = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta.total;
  const columns = isExtraWide ? 3 : 2;
  const activeFilters = countActiveFilters(params);
  const categoryName = categories?.find(({ slug }) => slug === category)?.name;
  const title = q ? `Resultados para "${q}"` : (categoryName ?? 'Catálogo');

  const update = (changes: Partial<CatalogParams>) => router.setParams(changes);

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <PageTitle title={`${title} | Bag of Holding`} />
      <Container className="gap-4 pt-4 md:gap-6 md:pt-8">
        {!isWide && (
          <View className="flex-row">
            <SearchField key={q ?? ''} initialValue={q} onSubmit={(term) => update({ q: term || undefined })} />
          </View>
        )}

        <View className="gap-1">
          <Text variant="h1">{title}</Text>
          <Text aria-live="polite" variant="small" tone="muted">
            {total === undefined ? ' ' : total === 1 ? '1 produto' : `${total} produtos`}
          </Text>
        </View>

        <View className="flex-row gap-8">
          {isWide && (
            <View className="w-64">
              <CatalogFilters params={params} onChange={update} />
            </View>
          )}

          <View className="flex-1 gap-4">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              {!isWide && (
                <Button variant="secondary" icon={SlidersHorizontal} onPress={() => setFiltersOpen(true)}>
                  {activeFilters > 0 ? `Filtros (${activeFilters})` : 'Filtros'}
                </Button>
              )}
              <View className="ml-auto">
                <Select
                  label="Ordenar"
                  value={sort ?? 'newest'}
                  options={sortOptions}
                  onChange={(value) => update({ sort: value === 'newest' ? undefined : value })}
                />
              </View>
            </View>

            {query.isLoading && <ProductGridSkeleton columns={columns} count={PAGE_SIZE} />}
            {query.isError && <ErrorState onRetry={query.refetch} />}
            {query.isSuccess && products.length === 0 && (
              <EmptyState
                icon={PackageSearch}
                title="Nenhum produto encontrado"
                description="Tente buscar por outro termo ou remova alguns filtros."
              />
            )}
            {products.length > 0 && <ProductGrid products={products} columns={columns} />}
            {query.hasNextPage && (
              <Button
                variant="secondary"
                className="mt-2 self-center"
                loading={query.isFetchingNextPage}
                onPress={() => query.fetchNextPage()}
              >
                Carregar mais
              </Button>
            )}
          </View>
        </View>
      </Container>
      <Footer />

      <Sheet
        visible={filtersOpen}
        title="Filtros"
        onClose={() => setFiltersOpen(false)}
        footer={
          <Button fullWidth onPress={() => setFiltersOpen(false)}>
            {total === undefined ? 'Ver produtos' : `Ver ${total} ${total === 1 ? 'produto' : 'produtos'}`}
          </Button>
        }
      >
        <CatalogFilters params={params} onChange={update} />
      </Sheet>
    </ScrollView>
  );
}
