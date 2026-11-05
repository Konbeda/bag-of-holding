import { showToast } from '@/components/ui';
import { type CartResponse, mergeGuestCartRequest } from '@/features/cart/api';
import { useGuestCart } from '@/features/cart/guest-store';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/query-client';

import { applySession, clearSession, type User } from './session';

type AuthResponse = { data: User; token: string };

async function startSession({ token, data }: AuthResponse) {
  await applySession(token, data);

  if (!useGuestCart.persist.hasHydrated()) await useGuestCart.persist.rehydrate();

  const { items, clear } = useGuestCart.getState();

  if (items.length === 0) return;

  try {
    queryClient.setQueryData<CartResponse>(['cart'], await mergeGuestCartRequest(items));
    clear();
  } catch {
    showToast('Não foi possível trazer os itens do seu carrinho anterior.', 'error');
  }
}

export async function signIn(email: string, password: string) {
  await startSession(
    await api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  );
}

export async function signUp(input: { name: string; email: string; password: string; password_confirmation: string }) {
  await startSession(await api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }));
}

export async function signOut() {
  await api('/auth/logout', { method: 'POST' }).catch(() => null);
  await clearSession();
  queryClient.clear();
}

export async function expireSession() {
  await clearSession();
  for (const queryKey of [['cart'], ['orders'], ['addresses']]) queryClient.removeQueries({ queryKey });
}
