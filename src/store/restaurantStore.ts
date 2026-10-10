import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckoutPayload, Order, OrderStatus, Product } from "@/types";
import { products as seedProducts } from "@/data/products";
import { generateMockOrders } from "@/data/orders";
import { calculateTotals, generateOrderId, roundMoney } from "@/lib/utils";

export interface StoreSettings {
  isOpenForOrders: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  soundAlerts: boolean;
}

export type NewProductInput = Omit<
  Product,
  "id" | "rating" | "reviews" | "soldCount"
>;

interface RestaurantState {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  seededAt: number;
  addProduct: (product: NewProductInput) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;

  placeOrder: (payload: CheckoutPayload) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;
  markOrderSeen: (id: string) => void;

  updateSettings: (settings: Partial<StoreSettings>) => void;
  resetDemo: () => void;
}

const defaultSettings: StoreSettings = {
  isOpenForOrders: true,
  deliveryFee: 3.5,
  freeDeliveryThreshold: 50,
  emailNotifications: true,
  smsNotifications: false,
  soundAlerts: true,
};

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      orders: generateMockOrders(),
      settings: defaultSettings,
      seededAt: Date.now(),

      addProduct: (data) => {
        const product: Product = {
          ...data,
          id: `p${Date.now()}`,
          rating: 5,
          reviews: 0,
          soldCount: 0,
        };
        set((state) => ({ products: [product, ...state.products] }));
        return product;
      },

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      toggleAvailability: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p,
          ),
        })),

      placeOrder: (payload) => {
        const rawSubtotal = roundMoney(
          payload.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
        );
        const { subtotal, deliveryFee, total } = calculateTotals(
          rawSubtotal,
          payload.deliveryType,
          get().settings,
        );

        const order: Order = {
          id: generateOrderId(),
          customer: payload.customer,
          items: payload.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
          })),
          subtotal,
          deliveryFee,
          total,
          status: "pending",
          paymentStatus: "paid",
          paymentMethod: "card",
          cardLast4: payload.cardLast4,
          cardBrand: payload.cardBrand,
          deliveryType: payload.deliveryType,
          note: payload.note,
          createdAt: new Date().toISOString(),
          isNew: true,
        };

        set((state) => ({
          orders: [order, ...state.orders],
          products: state.products.map((p) => {
            const sold = payload.items
              .filter((item) => item.productId === p.id)
              .reduce((sum, item) => sum + item.quantity, 0);
            return sold ? { ...p, soldCount: p.soldCount + sold } : p;
          }),
        }));

        return order;
      },

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status, isNew: false } : o,
          ),
        })),

      cancelOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: "cancelled",
                  paymentStatus: "refunded",
                  isNew: false,
                }
              : o,
          ),
        })),

      markOrderSeen: (id) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, isNew: false } : o,
          ),
        })),

      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

      resetDemo: () =>
        set({
          products: seedProducts,
          orders: generateMockOrders(),
          settings: defaultSettings,
          seededAt: Date.now(),
        }),
    }),
    {
      name: "mk-restaurant",
      version: 2,
      // Slide saved orders forward so the demo always looks "live", however many days later it's opened
      merge: (persisted, current) => {
        const saved = persisted as Partial<RestaurantState>;
        const merged = { ...current, ...saved };
        const shift = saved.seededAt ? Date.now() - saved.seededAt : 0;
        if (shift < 60 * 60 * 1000) return merged;
        return {
          ...merged,
          seededAt: Date.now(),
          orders: merged.orders.map((o) => ({
            ...o,
            createdAt: new Date(
              new Date(o.createdAt).getTime() + shift,
            ).toISOString(),
          })),
        };
      },
    },
  ),
);
