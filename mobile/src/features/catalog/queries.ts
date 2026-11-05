import { keepPreviousData, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api, toQueryString } from '@/lib/api';

export type Taxonomy = {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  specifications: Record<string, string>;
  category?: Taxonomy;
  brand?: Taxonomy;
  images: { url: string; alt: string }[];
};

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  featured?: string;
  sort?: string;
  per_page?: number;
};

type ProductPage = {
  data: Product[];
  meta: { current_page: number; last_page: number; total: number };
};

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ data: Taxonomy[] }>('/categories'),
    select: (response) => response.data,
    staleTime: 5 * 60_000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => api<{ data: Taxonomy[] }>('/brands'),
    select: (response) => response.data,
    staleTime: 5 * 60_000,
  });
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: () => api<ProductPage>(`/products${toQueryString(filters)}`),
    select: (response) => response.data,
  });
}

export function useInfiniteProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<ProductPage>(`/products${toQueryString({ ...filters, page: pageParam })}`),
    getNextPageParam: ({ meta }) => (meta.current_page < meta.last_page ? meta.current_page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ['products', 'detail', slug],
    queryFn: () => api<{ data: Product }>(`/products/${encodeURIComponent(slug)}`),
    select: (response: { data: Product }) => response.data,
  });
}

export function useProduct(slug: string) {
  return useQuery(productQuery(slug));
}

export type ShippingQuote = {
  price_cents: number;
  estimated_days: number;
  region: string;
  free_shipping_from_cents: number;
};

export function useShippingQuote(zipCode: string | null, subtotalCents: number) {
  return useQuery({
    queryKey: ['shipping', zipCode, subtotalCents],
    queryFn: () =>
      api<{ data: ShippingQuote }>(
        `/shipping/quote${toQueryString({ zip_code: zipCode ?? '', subtotal_cents: subtotalCents })}`,
      ),
    select: (response) => response.data,
    enabled: zipCode !== null,
    retry: false,
  });
}
