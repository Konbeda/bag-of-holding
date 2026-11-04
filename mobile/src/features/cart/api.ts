import type { Product } from '@/features/catalog/queries';
import { api } from '@/lib/api';

import type { GuestItem } from './guest-store';

export type CartResponse = {
  data: {
    items: {
      product: Product;
      quantity: number;
      line_total_cents: number;
      is_available: boolean;
    }[];
    items_count: number;
    subtotal_cents: number;
  };
};

export function fetchCart() {
  return api<CartResponse>('/cart');
}

export function addItemRequest(productId: number, quantity: number) {
  return api<CartResponse>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function updateItemRequest(productId: number, quantity: number) {
  return api<CartResponse>(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
}

export function removeItemRequest(productId: number) {
  return api<CartResponse>(`/cart/items/${productId}`, { method: 'DELETE' });
}

export function mergeGuestCartRequest(items: GuestItem[]) {
  return api<CartResponse>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map(({ productId, quantity }) => ({ product_id: productId, quantity })),
    }),
  });
}
