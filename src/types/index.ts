export type CategoryId = 'rice' | 'soups' | 'grills' | 'mains' | 'sides' | 'drinks' | 'desserts';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
  emoji: string;
}

export interface SizeOption {
  label: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  rating: number;
  reviews: number;
  prepTime: string;
  spiceLevel: 0 | 1 | 2 | 3;
  calories: number;
  ingredients: string[];
  tags: string[];
  sizes?: SizeOption[];
  isFeatured: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  soldCount: number;
}

export interface CartItem {
  /** productId + size, so the same dish in two sizes stays separate */
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
}

export type OrderItem = Omit<CartItem, 'id'>;

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentStatus = 'paid' | 'refunded' | 'failed';

export type DeliveryType = 'delivery' | 'pickup';

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'card';
  cardLast4: string;
  cardBrand: string;
  deliveryType: DeliveryType;
  note?: string;
  createdAt: string;
  /** true for orders placed through the live website during the demo */
  isNew?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface CheckoutPayload {
  customer: OrderCustomer;
  items: CartItem[];
  deliveryType: DeliveryType;
  note?: string;
  cardLast4: string;
  cardBrand: string;
}
