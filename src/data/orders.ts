import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types';
import { products } from './products';
import { customers } from './customers';
import { calculateTotals, roundMoney } from '@/lib/utils';

/** Seeded random so the demo data has the same shape every time it's generated */
function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const brands = ['Visa', 'Mastercard', 'Verve', 'Visa', 'Mastercard'];

export function generateMockOrders(count = 96): Order[] {
  const rand = mulberry32(2026);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const now = Date.now();
  const orders: Order[] = [];
  const available = products.filter((p) => p.isAvailable);

  for (let i = 0; i < count; i++) {
    // The first orders are very recent so the dashboard has live activity
    const hoursAgo = i < 6 ? 0.1 + rand() * 5 : 5 + rand() * 24 * 30;
    const createdAt = new Date(now - hoursAgo * 3_600_000).toISOString();
    const customer = pick(customers);

    const items: OrderItem[] = [];
    const used = new Set<string>();
    const lineCount = 1 + Math.floor(rand() * 4);
    for (let j = 0; j < lineCount; j++) {
      const product = pick(available);
      if (used.has(product.id)) continue;
      used.add(product.id);
      items.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size: product.sizes?.[0]?.label,
        quantity: 1 + Math.floor(rand() * 3),
      });
    }

    const rawSubtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const deliveryType = rand() > 0.2 ? 'delivery' : 'pickup';
    const { subtotal, deliveryFee, total } = calculateTotals(rawSubtotal, deliveryType);

    let status: OrderStatus;
    if (hoursAgo < 1) status = 'pending';
    else if (hoursAgo < 2.5) status = 'preparing';
    else if (hoursAgo < 5) status = 'out_for_delivery';
    else status = 'delivered';

    let paymentStatus: PaymentStatus = 'paid';
    const roll = rand();
    if (hoursAgo >= 5 && roll < 0.05) {
      status = 'cancelled';
      paymentStatus = 'refunded';
    } else if (hoursAgo >= 5 && roll < 0.08) {
      status = 'cancelled';
      paymentStatus = 'failed';
    }

    orders.push({
      id: `MK-${10480 - i}`,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: deliveryType === 'pickup' ? 'Pickup at restaurant' : customer.address,
      },
      items,
      subtotal,
      deliveryFee,
      total,
      status,
      paymentStatus,
      paymentMethod: 'card',
      cardLast4: String(1000 + Math.floor(rand() * 8999)),
      cardBrand: pick(brands),
      deliveryType,
      note: rand() < 0.15 ? pick(['Less pepper please', 'Extra plantain 🙏', 'Call when you get to the gate', 'No onions']) : undefined,
      createdAt,
    });
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
