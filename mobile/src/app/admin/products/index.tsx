import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Boxes, PackageSearch, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AdminLoader, AdminPage } from '@/components/admin/AdminPage';
import { ErrorState } from '@/components/shop/ErrorState';
import { SearchField } from '@/components/shop/SearchField';
import { Badge, Button, Card, D20Mark, EmptyState, IconButton, Input, Sheet, showToast, Text } from '@/components/ui';
import { toProductInput, useAdminProducts, useDeleteProduct, useSaveProduct } from '@/features/admin/queries';
import type { Product } from '@/features/catalog/queries';
import { fieldError } from '@/lib/api';
import { formatBRL } from '@/lib/format';
import { colors } from '@/theme';

const LOW_STOCK = 5;

function StockForm({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const save = useSaveProduct();
  const [stock, setStock] = useState(String(product.stock));

  const submit = () =>
    save.mutate(
      { id: product.id, input: { ...toProductInput(product), stock: stock === '' ? null : Number(stock) } },
      { onSuccess: onSaved },
    );

  return (
    <View className="gap-4">
      <Text variant="small" tone="secondary">
        {product.name}
      </Text>
      <Input
        label="Unidades em estoque"
        keyboardType="number-pad"
        value={stock}
        onChangeText={(value) => setStock(value.replace(/\D/g, '').slice(0, 6))}
        onSubmitEditing={submit}
        error={save.error ? (fieldError(save.error, 'stock') ?? save.error.message) : undefined}
      />
      <Button fullWidth loading={save.isPending} onPress={submit}>
        Salvar estoque
      </Button>
    </View>
  );
}

function ProductRow({
  product,
  onStock,
  onDelete,
}: {
  product: Product;
  onStock: () => void;
  onDelete: () => void;
}) {
  const image = product.images[0];

  return (
    <Card className="flex-row items-center gap-3 p-3">
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface">
        {image ? (
          <Image source={{ uri: image.url }} alt={image.alt} contentFit="contain" style={{ width: '100%', height: '100%' }} />
        ) : (
          <D20Mark size={24} color={colors.line.strong} />
        )}
      </View>
      <View className="flex-1 gap-1">
        <Text variant="small" weight="medium" numberOfLines={1}>
          {product.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {`${formatBRL(product.price_cents)} · ${product.category?.name ?? '-'}`}
        </Text>
        <View className="flex-row flex-wrap gap-1">
          <Badge tone={product.stock === 0 ? 'danger' : product.stock <= LOW_STOCK ? 'warning' : 'neutral'}>
            {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
          </Badge>
          {!product.is_active && <Badge tone="neutral">Inativo</Badge>}
          {product.is_featured && <Badge tone="primary">Destaque</Badge>}
        </View>
      </View>
      <View className="flex-row">
        <IconButton icon={Boxes} label={`Ajustar estoque de ${product.name}`} size="sm" onPress={onStock} />
        <Link href={{ pathname: '/admin/products/[id]', params: { id: product.id } }} asChild>
          <IconButton icon={Pencil} label={`Editar ${product.name}`} size="sm" />
        </Link>
        <IconButton icon={Trash2} label={`Excluir ${product.name}`} size="sm" onPress={onDelete} />
      </View>
    </Card>
  );
}

export default function AdminProductsScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = useAdminProducts(q);
  const remove = useDeleteProduct();
  // The sheets keep their product while closing, so the content stays in place during the fade
  const [stocking, setStocking] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [deleting, setDeleting] = useState<{ open: boolean; product?: Product }>({ open: false });

  const products = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta.total;

  const closeStock = () => setStocking((current) => ({ ...current, open: false }));
  const closeDelete = () => {
    setDeleting((current) => ({ ...current, open: false }));
    remove.reset();
  };

  return (
    <AdminPage
      title="Produtos"
      action={
        <Link href="/admin/products/new" asChild>
          <Button icon={Plus}>Novo produto</Button>
        </Link>
      }
    >
      <View className="flex-row">
        <SearchField key={q ?? ''} initialValue={q} onSubmit={(term) => router.setParams({ q: term || undefined })} />
      </View>
      <Text aria-live="polite" variant="small" tone="muted">
        {total === undefined ? ' ' : total === 1 ? '1 produto' : `${total} produtos`}
      </Text>

      {query.isLoading && <AdminLoader />}
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {query.isSuccess && products.length === 0 && (
        <EmptyState icon={PackageSearch} title="Nenhum produto encontrado" description="Tente buscar por outro termo." />
      )}

      <View className="gap-2">
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onStock={() => setStocking({ open: true, product })}
            onDelete={() => setDeleting({ open: true, product })}
          />
        ))}
      </View>

      {query.hasNextPage && (
        <Button variant="secondary" className="self-center" loading={query.isFetchingNextPage} onPress={() => query.fetchNextPage()}>
          Carregar mais
        </Button>
      )}

      <Sheet visible={stocking.open} title="Ajustar estoque" onClose={closeStock}>
        {stocking.product && (
          <StockForm
            product={stocking.product}
            onSaved={() => {
              closeStock();
              showToast('Estoque atualizado.', 'success');
            }}
          />
        )}
      </Sheet>

      <Sheet visible={deleting.open} title="Excluir produto" onClose={closeDelete}>
        {deleting.product && (
          <View className="gap-4">
            <Text variant="small" weight="medium">
              {deleting.product.name}
            </Text>
            <Text variant="small" tone="muted">
              O produto sai da loja e dos carrinhos. Pedidos já feitos não mudam.
            </Text>
            {remove.error && (
              <Text role="alert" variant="small" tone="danger">
                {remove.error.message}
              </Text>
            )}
            <Button
              variant="danger"
              fullWidth
              loading={remove.isPending}
              onPress={() =>
                remove.mutate(deleting.product!.id, {
                  onSuccess: () => {
                    closeDelete();
                    showToast('Produto excluído.', 'success');
                  },
                })
              }
            >
              Excluir produto
            </Button>
          </View>
        )}
      </Sheet>
    </AdminPage>
  );
}
