import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { roundMoney } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, sizeLabel?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, sizeLabel) =>
        set((state) => {
          const size = product.sizes?.find((s) => s.label === sizeLabel) ?? product.sizes?.[0];
          const id = size ? `${product.id}__${size.label}` : product.id;
          const unitPrice = roundMoney(product.price + (size?.priceDelta ?? 0));
          const existing = state.items.find((item) => item.id === id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id,
                productId: product.id,
                name: product.name,
                image: product.image,
                price: unitPrice,
                size: size?.label,
                quantity,
              },
            ],
          };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'mk-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  roundMoney(state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
