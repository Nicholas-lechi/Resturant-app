import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Check, ChefHat, ClipboardCheck, Home, PackageCheck, Phone, Search, XCircle } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { siteConfig, whatsappLink } from '@/config/site';
import { cn, formatDate, formatPrice, orderStatusFlow } from '@/lib/utils';
import { SmartImage } from '@/components/ui/SmartImage';
import { OrderStatusBadge } from '@/components/ui/Badges';
import { WhatsAppIcon } from '@/components/site/SocialIcons';

const steps = [
  { status: 'pending', icon: ClipboardCheck, title: 'Order received', text: 'We have your order and payment.' },
  { status: 'preparing', icon: ChefHat, title: 'Preparing', text: 'Your food is being cooked fresh.' },
  { status: 'out_for_delivery', icon: Bike, title: 'Out for delivery', text: 'A rider is on the way to you.' },
  { status: 'delivered', icon: PackageCheck, title: 'Delivered', text: 'Enjoy your meal! 🍽️' },
] as const;

export function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const order = useRestaurantStore((s) => s.orders.find((o) => o.id === id));
  const justPlaced = params.get('placed') === '1';

  if (!order) return <TrackLookup notFoundId={id} />;

  const currentIndex = orderStatusFlow.indexOf(order.status);
  const cancelled = order.status === 'cancelled';

  return (
    <section className="container-x max-w-5xl py-12">
      {justPlaced && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-herb-500 to-herb-600 p-8 text-center text-white sm:p-12"
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto grid size-20 place-items-center rounded-full bg-white"
          >
            <Check className="size-10 text-herb-600" strokeWidth={3} />
          </motion.div>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">Thank you, {order.customer.name.split(' ')[0]}!</h1>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Your payment of <strong>{formatPrice(order.total)}</strong> was successful and your order has been sent to
            Monica's kitchen. A receipt has been sent to {order.customer.email}.
          </p>
        </motion.div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">Order number</p>
          <h2 className="font-display text-4xl font-bold">#{order.id}</h2>
          <p className="mt-1 text-sm text-ink-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} className="px-4 py-2 text-sm" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6 sm:p-8">
          <h3 className="text-2xl font-bold">Order status</h3>
          <p className="mt-1 text-sm text-ink-500">This page updates automatically as the kitchen moves your order along.</p>

          {cancelled ? (
            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-rose-50 p-5 text-rose-800">
              <XCircle className="size-6 shrink-0" />
              <div>
                <p className="font-semibold">This order was cancelled</p>
                <p className="text-sm">Your payment has been refunded to your card ending in {order.cardLast4}.</p>
              </div>
            </div>
          ) : (
            <ol className="mt-8 space-y-0">
              {steps.map((s, i) => {
                const done = i < currentIndex || order.status === 'delivered';
                const active = i === currentIndex && order.status !== 'delivered';
                const Icon = s.icon;
                return (
                  <li key={s.status} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < steps.length - 1 && (
                      <span className={cn('absolute top-12 left-6 h-[calc(100%-3rem)] w-0.5', i < currentIndex ? 'bg-herb-500' : 'bg-ink-900/10')} />
                    )}
                    <span
                      className={cn(
                        'relative grid size-12 shrink-0 place-items-center rounded-2xl transition',
                        done && 'bg-herb-500 text-white',
                        active && 'bg-brand-500 text-white shadow-glow',
                        !done && !active && 'bg-cream-200 text-ink-500',
                      )}
                    >
                      {active && <span className="absolute inset-0 animate-ping rounded-2xl bg-brand-500 opacity-30" />}
                      <Icon className="size-5" />
                    </span>
                    <div className="pt-1">
                      <p className={cn('font-semibold', !done && !active ? 'text-ink-500' : 'text-ink-900')}>{s.title}</p>
                      <p className="text-sm text-ink-500">{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-10 grid gap-3 border-t border-ink-900/5 pt-6 sm:grid-cols-2">
            <a href={whatsappLink(`Hi Monica's Kitchen, I'm checking on my order #${order.id}.`)} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]">
              <WhatsAppIcon className="size-5" /> Ask about my order
            </a>
            <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className="btn-outline">
              <Phone className="size-4" /> Call the kitchen
            </a>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold">Items</h3>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                  <SmartImage src={item.image} alt={item.name} wrapperClassName="size-12 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.quantity} × {item.name}</p>
                    {item.size && <p className="text-xs text-ink-500">{item.size}</p>}
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-ink-900/10 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-600">Delivery</span><span>{order.deliveryFee ? formatPrice(order.deliveryFee) : 'FREE'}</span></div>
              <div className="flex justify-between pt-2 text-base font-bold"><span>Total paid</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
          <div className="card space-y-3 p-6 text-sm">
            <h3 className="text-xl font-bold">{order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} details</h3>
            <p><span className="text-ink-500">Name:</span> {order.customer.name}</p>
            <p><span className="text-ink-500">Phone:</span> {order.customer.phone}</p>
            <p><span className="text-ink-500">Address:</span> {order.deliveryType === 'pickup' ? siteConfig.address : order.customer.address}</p>
            <p><span className="text-ink-500">Paid with:</span> {order.cardBrand} •••• {order.cardLast4}</p>
            {order.note && <p className="rounded-xl bg-cream-100 p-3"><span className="text-ink-500">Note:</span> {order.note}</p>}
          </div>
          <Link to="/menu" className="btn-dark w-full">
            <Home className="size-4" /> Order something else
          </Link>
        </aside>
      </div>
    </section>
  );
}

function TrackLookup({ notFoundId }: { notFoundId?: string }) {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) navigate(`/order/${id.startsWith('MK-') ? id : `MK-${id}`}`);
  };
  return (
    <section className="container-x flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-brand-50">
        <Search className="size-7 text-brand-500" />
      </div>
      <h1 className="mt-6 text-4xl font-bold">Track your order</h1>
      {notFoundId && notFoundId !== 'track' && (
        <p className="mt-3 text-sm text-rose-600">We couldn't find order “{notFoundId}”.</p>
      )}
      <p className="mt-3 text-ink-600">Enter the order number from your confirmation (e.g. MK-10480).</p>
      <form onSubmit={submit} className="mt-6 flex w-full gap-2">
        <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="MK-10480" />
        <button className="btn-primary">Track</button>
      </form>
    </section>
  );
}

function Confetti() {
  const colors = ['#ffd0a8', '#ffffff', '#ff7f38', '#fde68a', '#bbf7d0'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-3 w-1.5 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, top: -20, backgroundColor: colors[i % colors.length] }}
          animate={{ y: [0, 420], rotate: [0, 360 * (i % 2 ? 1 : -1)], opacity: [1, 1, 0] }}
          transition={{ duration: 2.4 + (i % 5) * 0.4, delay: (i % 10) * 0.12, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
