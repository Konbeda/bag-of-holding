import { router } from 'expo-router';

import { AdminPage } from '@/components/admin/AdminPage';
import { ProductForm } from '@/components/admin/ProductForm';
import { showToast } from '@/components/ui';

export default function NewProductScreen() {
  return (
    <AdminPage title="Novo produto">
      <ProductForm
        onSaved={() => {
          showToast('Produto criado.', 'success');
          router.replace('/admin/products');
        }}
      />
    </AdminPage>
  );
}
