import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Input, Select, SwitchField, Text } from '@/components/ui';
import { useSaveProduct } from '@/features/admin/queries';
import { type Product, useBrands, useCategories } from '@/features/catalog/queries';
import { ApiError, fieldError } from '@/lib/api';
import { formatCentsInput, parseCentsInput } from '@/lib/format';

type ProductFormProps = {
  product?: Product;
  onSaved: (product: Product) => void;
};

function TaxonomySelect({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: number; name: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-1 gap-1.5">
      <Select
        label={label}
        value={value}
        options={[
          { value: '', label: 'Selecione' },
          ...options.map(({ id, name }) => ({ value: String(id), label: name })),
        ]}
        onChange={onChange}
      />
      {error && (
        <Text role="alert" variant="small" tone="danger">
          {error}
        </Text>
      )}
    </View>
  );
}

export function ProductForm({ product, onSaved }: ProductFormProps) {
  const save = useSaveProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const [values, setValues] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    category: product?.category ? String(product.category.id) : '',
    brand: product?.brand ? String(product.brand.id) : '',
    price: product ? formatCentsInput(String(product.price_cents)) : '',
    compareAt: product?.compare_at_price_cents ? formatCentsInput(String(product.compare_at_price_cents)) : '',
    stock: product ? String(product.stock) : '',
  });
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);

  const error = save.error;
  const generalError = error instanceof ApiError && Object.keys(error.errors).length > 0 ? null : error?.message;

  const set = (field: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [field]: value }));

  const submit = () => {
    save.mutate(
      {
        id: product?.id,
        input: {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description.trim(),
          category_id: values.category ? Number(values.category) : null,
          brand_id: values.brand ? Number(values.brand) : null,
          price_cents: parseCentsInput(values.price),
          compare_at_price_cents: parseCentsInput(values.compareAt),
          stock: values.stock === '' ? null : Number(values.stock),
          is_active: isActive,
          is_featured: isFeatured,
        },
      },
      { onSuccess: ({ data }) => onSaved(data) },
    );
  };

  return (
    <View className="gap-6">
      <Card className="gap-4 p-4">
        <Text variant="h3">Informações</Text>
        <Input label="Nome" value={values.name} onChangeText={set('name')} error={fieldError(error, 'name')} />
        <Input
          label="Endereço na loja"
          hint="Criado a partir do nome se ficar em branco."
          autoCapitalize="none"
          value={values.slug}
          onChangeText={set('slug')}
          error={fieldError(error, 'slug')}
        />
        <Input
          label="Descrição"
          multiline
          numberOfLines={5}
          style={{ minHeight: 112, textAlignVertical: 'top' }}
          value={values.description}
          onChangeText={set('description')}
          error={fieldError(error, 'description')}
        />
        <View className="gap-3 md:flex-row">
          <TaxonomySelect
            label="Categoria"
            value={values.category}
            options={categories}
            error={fieldError(error, 'category_id')}
            onChange={set('category')}
          />
          <TaxonomySelect
            label="Marca"
            value={values.brand}
            options={brands}
            error={fieldError(error, 'brand_id')}
            onChange={set('brand')}
          />
        </View>
      </Card>

      <Card className="gap-4 p-4">
        <Text variant="h3">Preço e estoque</Text>
        <View className="gap-4 md:flex-row md:items-start">
          <Input
            label="Preço (R$)"
            placeholder="0,00"
            keyboardType="number-pad"
            value={values.price}
            onChangeText={(value) => set('price')(formatCentsInput(value))}
            error={fieldError(error, 'price_cents')}
            className="md:flex-1"
          />
          <Input
            label="Preço anterior (R$)"
            hint="Opcional. Aparece riscado na loja."
            placeholder="0,00"
            keyboardType="number-pad"
            value={values.compareAt}
            onChangeText={(value) => set('compareAt')(formatCentsInput(value))}
            error={fieldError(error, 'compare_at_price_cents')}
            className="md:flex-1"
          />
          <Input
            label="Estoque"
            keyboardType="number-pad"
            value={values.stock}
            onChangeText={(value) => set('stock')(value.replace(/\D/g, '').slice(0, 6))}
            error={fieldError(error, 'stock')}
            className="md:flex-1"
          />
        </View>
      </Card>

      <Card className="gap-4 p-4">
        <Text variant="h3">Visibilidade</Text>
        <SwitchField label="Ativo" hint="Produtos inativos não aparecem na loja." value={isActive} onChange={setIsActive} />
        <SwitchField label="Em destaque" hint="Aparece na página inicial." value={isFeatured} onChange={setIsFeatured} />
      </Card>

      {generalError && (
        <Text role="alert" variant="small" tone="danger">
          {generalError}
        </Text>
      )}

      <View className="flex-row flex-wrap gap-3">
        <Button size="lg" loading={save.isPending} onPress={submit}>
          Salvar produto
        </Button>
        <Link href="/admin/products" asChild>
          <Button size="lg" variant="secondary">
            Cancelar
          </Button>
        </Link>
      </View>
    </View>
  );
}
