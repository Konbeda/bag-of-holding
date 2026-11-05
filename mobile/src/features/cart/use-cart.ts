import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { showToast } from '@/components/ui';
import { useSession } from '@/features/auth/session';
import { type Product, productQuery } from '@/features/catalog/queries';
import { ApiError } from '@/lib/api';

import { addItemRequest, type CartResponse, fetchCart, removeItemRequest, updateItemRequest } from './api';
import { useGuestCart } from './guest-store';

const MAX_QUANTITY = 99;

export type CartLine = {
  product: Product;
  quantity: number;
  lineTotalCents: number;
  isAvailable: boolean;
};

export function useCartCount(): number {
  const signedIn = useSession((state) => Boolean(state.user));
  const guestCount = useGuestCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: signedIn,
    select: (response) => response.data.items_count,
  });

  return signedIn ? (data ?? 0) : guestCount;
}

export function useCart() {
  const signedIn = useSession((state) => Boolean(state.user));
  const guestItems = useGuestCart((state) => state.items);
  const removeGuestItem = useGuestCart((state) => state.remove);

  const server = useQuery({ queryKey: ['cart'], queryFn: fetchCart, enabled: signedIn });
  const guest = useQueries({
    queries: signedIn ? [] : guestItems.map((item) => ({ ...productQuery(item.slug), staleTime: 0 })),
  });

  // Products that left the catalog can never be bought again, so they leave the guest cart too
  const missingIds = signedIn
    ? ''
    : guestItems
        .filter((_, index) => {
          const error = guest[index]?.error;

          return error instanceof ApiError && error.status === 404;
        })
        .map((item) => item.productId)
        .join(',');

  useEffect(() => {
    if (missingIds) missingIds.split(',').forEach((id) => removeGuestItem(Number(id)));
  }, [missingIds, removeGuestItem]);

  if (signedIn) {
    const cart = server.data?.data;

    return {
      lines: (cart?.items ?? []).map<CartLine>((item) => ({
        product: item.product,
        quantity: item.quantity,
        lineTotalCents: item.line_total_cents,
        isAvailable: item.is_available,
      })),
      subtotalCents: cart?.subtotal_cents ?? 0,
      isLoading: server.isLoading,
      isError: server.isError,
      refetch: server.refetch,
    };
  }

  const lines = guestItems.flatMap<CartLine>((item, index) => {
    const product = guest[index]?.data;

    return product
      ? [
          {
            product,
            quantity: item.quantity,
            lineTotalCents: product.price_cents * item.quantity,
            isAvailable: product.is_active && product.stock >= item.quantity,
          },
        ]
      : [];
  });

  return {
    lines,
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
    isLoading: guest.some((query) => query.isLoading),
    isError: guest.some((query) => query.isError && !(query.error instanceof ApiError && query.error.status === 404)),
    refetch: async () => {
      await Promise.all(guest.map((query) => query.refetch()));
    },
  };
}

function stockMessage(product: Product) {
  return `Temos apenas ${product.stock} unidade(s) de ${product.name} em estoque.`;
}

export function useCartActions() {
  const queryClient = useQueryClient();
  const signedIn = useSession((state) => Boolean(state.user));
  const guest = useGuestCart();

  const mutation = useMutation({
    mutationFn: (request: () => Promise<CartResponse>) => request(),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
    onError: (error) => showToast(error.message, 'error'),
  });

  const add = async (product: Product, quantity = 1) => {
    if (signedIn) {
      await mutation.mutateAsync(() => addItemRequest(product.id, quantity));
    } else {
      const current = guest.items.find((item) => item.productId === product.id)?.quantity ?? 0;

      if (current + quantity > Math.min(product.stock, MAX_QUANTITY)) throw new Error(stockMessage(product));

      guest.add({ productId: product.id, slug: product.slug, quantity });
    }

    showToast('Produto adicionado ao carrinho.', 'success');
  };

  return {
    isPending: mutation.isPending,
    add: (product: Product, quantity = 1) =>
      add(product, quantity).catch((error: Error) => {
        // Server failures were already shown by the mutation
        if (!signedIn) showToast(error.message, 'error');
      }),
    setQuantity: (product: Product, quantity: number) => {
      if (signedIn) mutation.mutate(() => updateItemRequest(product.id, quantity));
      else guest.setQuantity(product.id, quantity);
    },
    remove: (product: Product) => {
      if (signedIn) mutation.mutate(() => removeItemRequest(product.id));
      else guest.remove(product.id);
    },
  };
}
