import { useState } from 'react';
import { Ban, Check, ChevronRight, Clock, CreditCard, Mail, MapPin, MessageSquare, Phone, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/types';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn, formatDate, formatPrice, nextStatus, nextStatusAction, orderStatusFlow, orderStatusMeta } from '@/lib/utils';
import { Drawer, Modal } from '@/components/ui/Modal';
import { SmartImage } from '@/components/ui/SmartImage';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badges';

export function OrderDetailsDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const updateOrderStatus = useRestaurantStore((s) => s.updateOrderStatus);
  const cancelOrder = useRestaurantStore((s) => s.cancelOrder);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const advance = () => {
    if (!order) return;
    const next = nextStatus(order.status);
    if (!next) return;
    updateOrderStatus(order.id, next);
    toast.success(`Order #${order.id} → ${orderStatusMeta[next].label}`, {
      description: 'The customer can see this update on their order page.',
    });
  };

  const currentIndex = order ? orderStatusFlow.indexOf(order.status) : -1;
  const next = order ? nextStatus(order.status) : null;

  return (
    <>
      <Drawer open={!!order} onClose={onClose} className="max-w-lg">
        {order && (
          <>
            <div className="flex items-start justify-between border-b border-ink-900/5 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-xl font-bold">Order #{order.id}</h3>
                  {order.isNew && <span className="chip bg-brand-500 px-2 py-0.5 text-[10px] text-white">NEW</span>}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <Clock className="size-3.5" /> {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => window.print()} className="rounded-full p-2 text-ink-500 hover:bg-cream-200" title="Print receipt">
                  <Printer className="size-5" />
                </button>
                <button onClick={onClose} className="rounded-full p-2 text-ink-500 hover:bg-cream-200" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
                <span className="chip bg-cream-200 text-ink-800 capitalize">{order.deliveryType}</span>
              </div>

              {order.status !== 'cancelled' && (
                <div className="flex items-center">
                  {orderStatusFlow.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            'grid size-7 place-items-center rounded-full text-xs font-bold',
                            i <= currentIndex ? 'bg-herb-500 text-white' : 'bg-cream-200 text-ink-500',
                          )}
                        >
                          {i <= currentIndex ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="w-16 text-center text-[10px] leading-tight text-ink-500">{orderStatusMeta[s].label}</span>
                      </div>
                      {i < orderStatusFlow.length - 1 && (
                        <span className={cn('mb-5 h-0.5 flex-1', i < currentIndex ? 'bg-herb-500' : 'bg-cream-200')} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <section className="rounded-2xl bg-cream-50 p-4">
                <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">Customer</p>
                <p className="mt-2 font-semibold text-ink-900">{order.customer.name}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                  <li className="flex items-center gap-2"><Phone className="size-4 text-ink-500" /> <a href={`tel:${order.customer.phone}`} className="hover:underline">{order.customer.phone}</a></li>
                  <li className="flex items-center gap-2"><Mail className="size-4 text-ink-500" /> {order.customer.email}</li>
                  <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-ink-500" /> {order.customer.address}</li>
                </ul>
              </section>

              {order.note && (
                <section className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <MessageSquare className="size-4 shrink-0" />
                  <p><strong>Note:</strong> {order.note}</p>
                </section>
              )}

              <section>
                <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">Items</p>
                <ul className="mt-3 divide-y divide-ink-900/5">
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-3">
                      <SmartImage src={item.image} alt={item.name} wrapperClassName="size-12 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-ink-500">
                          {item.size ? `${item.size} · ` : ''}
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 space-y-1.5 border-t border-ink-900/10 pt-3 text-sm">
                  <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span>{order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}</span></div>
                  <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                </div>
              </section>

              <section className="flex items-center gap-3 rounded-2xl border border-ink-900/5 p-4 text-sm">
                <CreditCard className="size-5 text-ink-500" />
                <div className="flex-1">
                  <p className="font-semibold">{order.cardBrand} •••• {order.cardLast4}</p>
                  <p className="text-xs text-ink-500">Online card payment</p>
                </div>
                <PaymentStatusBadge status={order.paymentStatus} />
              </section>
            </div>

            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div className="flex gap-2 border-t border-ink-900/5 bg-cream-50 px-6 py-4">
                <button onClick={() => setConfirmCancel(true)} className="btn-outline px-4 text-rose-600">
                  <Ban className="size-4" /> Cancel
                </button>
                {next && (
                  <button onClick={advance} className="btn-primary flex-1">
                    {nextStatusAction[order.status]} <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Drawer>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmCancel(false)} className="btn-ghost">Keep order</button>
            <button
              onClick={() => {
                if (order) {
                  cancelOrder(order.id);
                  toast(`Order #${order.id} cancelled`, { description: `${formatPrice(order.total)} refunded to the customer.` });
                }
                setConfirmCancel(false);
              }}
              className="btn bg-rose-600 text-white hover:bg-rose-700"
            >
              Cancel & refund
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">
          The customer will be refunded <strong>{order && formatPrice(order.total)}</strong> to their card. This can't be undone.
        </p>
      </Modal>
    </>
  );
}
