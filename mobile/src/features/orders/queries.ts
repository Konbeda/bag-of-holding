import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PostalAddress } from '@/features/addresses/queries';
import { api } from '@/lib/api';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
export type PaymentMethod = 'pix' | 'card';
export type PaymentOutcome = 'approved' | 'declined';

export type Order = {
  number: string;
  status: OrderStatus;
  status_label: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: PostalAddress;
  created_at: string;
  items: {
    product_id: number;
    product_name: string;
    unit_price_cents: number;
    quantity: number;
    line_total_cents: number;
  }[];
  payments: {
    method: PaymentMethod;
    method_label: string;
    status: string;
    status_label: string;
    amount_cents: number;
  }[];
};

type OrderPage = {
  data: Order[];
  meta: { current_page: number; last_page: number };
};

export function useInfiniteOrders() {
  return useInfiniteQuery({
    queryKey: ['orders', 'list'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<OrderPage>(`/orders?page=${pageParam}`),
    getNextPageParam: ({ meta }) => (meta.current_page < meta.last_page ? meta.current_page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(number: string) {
  return useQuery({
    queryKey: ['orders', 'detail', number],
    queryFn: () => api<{ data: Order }>(`/orders/${encodeURIComponent(number)}`),
    select: (response) => response.data,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { address_id: number; payment_method: PaymentMethod; simulated_outcome: PaymentOutcome }) =>
      api<{ data: Order }>('/checkout', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: ({ data }) => queryClient.setQueryData(['orders', 'detail', data.number], { data }),
    // A declined payment also creates a canceled order and returns its stock, so both outcomes refresh everything
    onSettled: () => {
      for (const queryKey of [['cart'], ['orders', 'list'], ['products'], ['addresses']]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
