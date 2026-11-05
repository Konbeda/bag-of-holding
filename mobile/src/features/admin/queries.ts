import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@/features/catalog/queries';
import type { Order, OrderStatus } from '@/features/orders/queries';
import { api, toQueryString } from '@/lib/api';

export type DailySales = {
  date: string;
  orders: number;
  revenue_cents: number;
};

export type Dashboard = {
  revenue_cents: number;
  revenue_orders_count: number;
  orders_by_status: Partial<Record<OrderStatus, number>>;
  sales_last_30_days: DailySales[];
  top_products: { product_name: string; units: number }[];
  low_stock: { id: number; name: string; stock: number }[];
};

export type ProductInput = {
  category_id: number | null;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  stock: number | null;
  is_active: boolean;
  is_featured: boolean;
};

export type AdminOrder = Order & {
  customer?: { name: string; email: string };
};

type Page<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

function nextPage<T>({ meta }: Page<T>) {
  return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
}

// Specifications and images are left out on purpose, so saving keeps what the product already has
export function toProductInput(product: Product): ProductInput {
  return {
    category_id: product.category?.id ?? null,
    brand_id: product.brand?.id ?? null,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price_cents: product.price_cents,
    compare_at_price_cents: product.compare_at_price_cents,
    stock: product.stock,
    is_active: product.is_active,
    is_featured: product.is_featured,
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api<{ data: Dashboard }>('/admin/dashboard'),
    select: (response) => response.data,
    staleTime: 0,
  });
}

export function useAdminProducts(q?: string) {
  return useInfiniteQuery({
    queryKey: ['admin', 'products', 'list', q ?? ''],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<Page<Product>>(`/admin/products${toQueryString({ q, page: pageParam })}`),
    getNextPageParam: nextPage,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'products', 'detail', id],
    queryFn: () => api<{ data: Product }>(`/admin/products/${encodeURIComponent(id)}`),
    select: (response) => response.data,
    staleTime: 0,
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: ProductInput }) =>
      api<{ data: Product }>(id ? `/admin/products/${id}` : '/admin/products', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/products/${id}`, { method: 'DELETE' }),
    // Deleting also removes the product from carts
    onSuccess: () =>
      Promise.all(
        [['admin'], ['products'], ['cart']].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

export function useAdminOrders(status?: string) {
  return useInfiniteQuery({
    queryKey: ['admin', 'orders', 'list', status ?? ''],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<Page<AdminOrder>>(`/admin/orders${toQueryString({ status, page: pageParam })}`),
    getNextPageParam: nextPage,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useAdminOrder(number: string) {
  return useQuery({
    queryKey: ['admin', 'orders', 'detail', number],
    queryFn: () => api<{ data: AdminOrder }>(`/admin/orders/${encodeURIComponent(number)}`),
    select: (response) => response.data,
    staleTime: 0,
  });
}

export function useChangeOrderStatus(number: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: OrderStatus) =>
      api<{ data: AdminOrder }>(`/admin/orders/${encodeURIComponent(number)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    // A rejected change means this screen is stale, so both outcomes refresh it; canceling also returns stock
    onSettled: () =>
      Promise.all(
        [['admin'], ['orders'], ['products']].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}
