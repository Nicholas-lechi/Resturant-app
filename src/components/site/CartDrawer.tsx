import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Modal';
import { SmartImage } from '@/components/ui/SmartImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState } from '@/components/ui/EmptyState';
import { selectCartCount, selectCartSubtotal, useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const { freeDeliveryThreshold } = useRestaurantStore((s) => s.settings);

  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const go = (path: string) => {
    closeCart();
    navigate(path);
  };

  return (
    <Drawer open={isOpen} onClose={closeCart}>
      <div className="flex items-center justify-between border-b border-ink-900/5 px-6 py-5">
        <div>
          <h3 className="text-2xl font-bold">Your Pack</h3>
          <p className="text-sm text-ink-500">
            {count} item{count === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={closeCart} className="rounded-full p-2 hover:bg-cream-200" aria-label="Close">
          <X className="size-5" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center">
          <EmptyState
            icon={ShoppingBag}
            title="Your pack is empty"
            description="Looks like you haven't added anything yet. Our jollof is waiting for you!"
            action={
              <button onClick={() => go('/menu')} className="btn-primary">
                Browse the menu
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="border-b border-ink-900/5 bg-cream-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-brand-500" />
              {remaining > 0 ? (
                <span>
                  Add <strong>{formatPrice(remaining)}</strong> more for <strong>free delivery</strong>
                </span>
              ) : (
                <span className="font-semibold text-herb-600">You've unlocked free delivery! 🎉</span>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-ink-900/5 overflow-y-auto px-6">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  className="flex gap-4 py-4"
                >
                  <SmartImage src={item.image} alt={item.name} wrapperClassName="size-20 shrink-0 rounded-2xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{item.name}</p>
                        {item.size && <p className="text-xs text-ink-500">{item.size}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-full p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper size="sm" value={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
                      <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="space-y-3 border-t border-ink-900/5 bg-cream-50 px-6 py-5">
            <div className="flex justify-between text-sm text-ink-600">
              <span>Subtotal</span>
              <span className="font-display text-xl font-bold text-ink-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-ink-500">Delivery fee calculated at checkout.</p>
            <button onClick={() => go('/checkout')} className="btn-primary w-full py-4 text-base">
              Checkout · {formatPrice(subtotal)}
            </button>
            <Link to="/cart" onClick={closeCart} className="btn-ghost w-full">
              View full pack
            </Link>
          </div>
        </>
      )}
    </Drawer>
  );
}
