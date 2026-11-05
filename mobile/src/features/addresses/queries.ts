import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';

export type PostalAddress = {
  recipient: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
};

export type Address = PostalAddress & {
  id: number;
  is_default: boolean;
};

export type AddressInput = PostalAddress & {
  is_default?: boolean;
};

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api<{ data: Address[] }>('/addresses'),
    select: (response) => response.data,
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: AddressInput }) =>
      api<{ data: Address }>(id ? `/addresses/${id}` : '/addresses', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(input),
      }),
    // Returning the promise keeps the mutation pending until the list includes the saved address
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api<void>(`/addresses/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
