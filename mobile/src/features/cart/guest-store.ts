import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type GuestItem = {
  productId: number;
  slug: string;
  quantity: number;
};

type GuestCartState = {
  items: GuestItem[];
  add: (item: GuestItem) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set(({ items }) => {
          const existing = items.find(({ productId }) => productId === item.productId);

          return {
            items: existing
              ? items.map((current) =>
                  current === existing ? { ...current, quantity: current.quantity + item.quantity } : current,
                )
              : [...items, item],
          };
        }),
      setQuantity: (productId, quantity) =>
        set(({ items }) => ({
          items: items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        })),
      remove: (productId) => set(({ items }) => ({ items: items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'guest-cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
