import { Link, router, useLocalSearchParams } from 'expo-router';
import { PackageX } from 'lucide-react-native';

import { AdminLoader, AdminPage } from '@/components/admin/AdminPage';
import { ProductForm } from '@/components/admin/ProductForm';
import { ErrorState } from '@/components/shop/ErrorState';
import { Button, EmptyState, showToast } from '@/components/ui';
import { useAdminProduct } from '@/features/admin/queries';
import { ApiError } from '@/lib/api';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, error, refetch } = useAdminProduct(id);

  let content;

  if (isLoading) {
    content = <AdminLoader />;
  } else if (error instanceof ApiError && error.status === 404) {
    content = (
      <EmptyState icon={PackageX} title="Produto não encontrado">
        <Link href="/admin/products" asChild>
          <Button className="self-center">Ver produtos</Button>
        </Link>
      </EmptyState>
    );
  } else if (!product) {
    content = <ErrorState onRetry={refetch} />;
  } else {
    content = (
      <ProductForm
        key={product.id}
        product={product}
        onSaved={() => {
          showToast('Produto salvo.', 'success');
          router.replace('/admin/products');
        }}
      />
    );
  }

  return <AdminPage title="Editar produto">{content}</AdminPage>;
}
