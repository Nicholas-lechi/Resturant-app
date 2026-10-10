import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { selectCartCount, selectCartSubtotal, useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { calculateTotals, formatPrice } from '@/lib/utils';
import { SmartImage } from '@/components/ui/SmartImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/site/ProductCard';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const settings = useRestaurantStore((s) => s.settings);
  const products = useRestaurantStore((s) => s.products);
  const totals = calculateTotals(subtotal, 'delivery', settings);

  const suggestions = products
    .filter((p) => (p.category === 'drinks' || p.category === 'desserts' || p.category === 'sides') && p.isAvailable)
    .filter((p) => !items.some((i) => i.productId === p.id))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <section className="container-x py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your pack is empty"
          description="Add some delicious meals to your pack and they'll show up here."
          action={<Link to="/menu" className="btn-primary">Browse the menu</Link>}
        />
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Continue shopping
      </Link>
      <div className="mt-4 flex items-end justify-between">
        <h1 className="text-4xl font-bold sm:text-5xl">Your Pack</h1>
        <button onClick={clearCart} className="text-sm font-semibold text-rose-600 hover:underline">
          Clear pack
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card divide-y divide-ink-900/5 p-2 sm:p-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 p-3 sm:items-center sm:gap-6"
              >
                <SmartImage src={item.image} alt={item.name} wrapperClassName="size-20 shrink-0 rounded-2xl sm:size-24" />
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold text-ink-900">{item.name}</p>
                    {item.size && <p className="text-sm text-ink-500">{item.size}</p>}
                    <p className="text-sm text-ink-500">{formatPrice(item.price)} each</p>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <QuantityStepper size="sm" value={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
                    <span className="w-20 text-right font-bold">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-2 text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">Items ({count})</span>
              <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Delivery fee</span>
              <span className="font-semibold">
                {totals.deliveryFee === 0 ? <span className="text-herb-600">FREE</span> : formatPrice(totals.deliveryFee)}
              </span>
            </div>
            {totals.deliveryFee > 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
                <Truck className="size-4" /> Add {formatPrice(settings.freeDeliveryThreshold - subtotal)} more for free delivery
              </p>
            )}
            <div className="flex items-center justify-between border-t border-ink-900/10 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-3xl font-bold">{formatPrice(totals.total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full py-4 text-base">
            Proceed to checkout <ArrowRight className="size-5" />
          </Link>
          <p className="text-center text-xs text-ink-500">Pickup option available at checkout</p>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-3xl font-bold">Complete your meal</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
