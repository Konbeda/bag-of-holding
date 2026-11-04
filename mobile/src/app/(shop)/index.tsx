import { Link } from 'expo-router';
import {
  BookOpen,
  CreditCard,
  Dices,
  type LucideIcon,
  Map as MapIcon,
  Package,
  Swords,
  Tag,
  Truck,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { ProductGrid, ProductGridSkeleton } from '@/components/shop/ProductGrid';
import { Button, Card, Container, D20Mark, Skeleton, Text } from '@/components/ui';
import { type ProductFilters, useCategories, useProducts } from '@/features/catalog/queries';
import { useBreakpoint } from '@/lib/use-breakpoint';
import { colors } from '@/theme';

const categoryIcons: Record<string, LucideIcon> = {
  dados: Dices,
  'livros-e-sistemas': BookOpen,
  miniaturas: Swords,
  'acessorios-de-mesa': MapIcon,
  'kits-para-iniciantes': Package,
};

const perks: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Truck, title: 'Frete grátis a partir de R$ 300', description: 'Entrega para todo o Brasil.' },
  { icon: CreditCard, title: 'Pix ou cartão', description: 'Escolha na hora de finalizar a compra.' },
  { icon: Tag, title: 'Da primeira sessão à campanha', description: 'Kits, livros, dados e miniaturas.' },
];

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between gap-4">
        <Text variant="h2" className="shrink">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function ProductSection({ title, filters, columns }: { title: string; filters: ProductFilters; columns: number }) {
  const count = columns === 2 ? 4 : columns;
  const { data, isLoading, isError, refetch } = useProducts({ ...filters, per_page: count });

  return (
    <Section
      title={title}
      action={
        <Link href="/catalog" asChild>
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </Link>
      }
    >
      {isLoading && <ProductGridSkeleton columns={columns} count={count} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && <ProductGrid products={data} columns={columns} />}
    </Section>
  );
}

export default function HomeScreen() {
  const { isWide, isExtraWide } = useBreakpoint();
  const { data: categories, isLoading } = useCategories();
  const columns = isExtraWide ? 4 : isWide ? 3 : 2;

  return (
    <ScrollView className="flex-1 bg-white">
      <PageTitle title="Bag of Holding: tudo para a sua próxima aventura" />
      <Container className="gap-10 pt-4 md:gap-14 md:pt-8">
        <View className="flex-row items-center justify-between overflow-hidden rounded-2xl bg-surface p-6 md:p-12">
          <View className="max-w-xl flex-1 gap-4">
            <Text variant="display">Tudo para a sua próxima aventura.</Text>
            <Text tone="secondary">
              Dados, livros, miniaturas e acessórios para quem joga RPG, da primeira sessão à campanha de anos.
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-3">
              <Link href="/catalog" asChild>
                <Button size="lg">Ver catálogo</Button>
              </Link>
              <Link href={{ pathname: '/catalog', params: { category: 'kits-para-iniciantes' } }} asChild>
                <Button size="lg" variant="secondary">
                  Começar a jogar
                </Button>
              </Link>
            </View>
          </View>
          {isWide && <D20Mark size={isExtraWide ? 240 : 160} />}
        </View>

        <Section title="Categorias">
          <View className="-m-1.5 flex-row flex-wrap">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <View key={index} className="w-1/2 p-1.5 md:w-1/5">
                  <Skeleton className="h-28 w-full rounded-lg" />
                </View>
              ))}
            {categories?.map(({ slug, name, products_count }) => {
              const Icon = categoryIcons[slug] ?? Package;

              return (
                <View key={slug} className="w-1/2 p-1.5 md:w-1/5">
                  <Link href={{ pathname: '/catalog', params: { category: slug } }} asChild>
                    <Pressable
                      role="link"
                      className="min-h-28 flex-1 gap-2 rounded-lg border border-line bg-white p-4 hover:border-primary hover:bg-primary-soft active:bg-primary-soft web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary"
                    >
                      <Icon size={24} color={colors.primary.DEFAULT} />
                      <Text variant="small" weight="semibold">
                        {name}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {products_count} produtos
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              );
            })}
          </View>
        </Section>

        <ProductSection title="Destaques" filters={{ featured: '1' }} columns={columns} />
        <ProductSection title="Novidades" filters={{ sort: 'newest' }} columns={columns} />

        <View className="gap-3 md:flex-row">
          {perks.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex-row items-center gap-3 p-4 md:flex-1">
              <Icon size={22} color={colors.ink.secondary} />
              <View className="shrink gap-0.5">
                <Text variant="small" weight="semibold">
                  {title}
                </Text>
                <Text variant="caption" tone="muted">
                  {description}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </Container>
      <Footer />
    </ScrollView>
  );
}
