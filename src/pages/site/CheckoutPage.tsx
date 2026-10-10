import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Bike,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Store,
  Wand2,
} from 'lucide-react';
import { selectCartSubtotal, useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { siteConfig } from '@/config/site';
import {
  calculateTotals,
  cn,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatPrice,
  sleep,
} from '@/lib/utils';
import type { DeliveryType } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

const emptyForm: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  note: '',
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
};

const processingSteps = ['Connecting to secure gateway', 'Verifying card details', 'Authorising payment', 'Sending order to the kitchen'];

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore(selectCartSubtotal);
  const settings = useRestaurantStore((s) => s.settings);
  const placeOrder = useRestaurantStore((s) => s.placeOrder);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);

  if (items.length === 0 && !processing) return <Navigate to="/cart" replace />;

  const totals = calculateTotals(subtotal, deliveryType, settings);
  const brand = detectCardBrand(form.cardNumber);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const fillDemo = () => {
    setErrors({});
    setForm({
      name: 'Adaeze Okafor',
      email: 'adaeze@example.com',
      phone: '+234 803 123 4567',
      address: '14 Woji Road, GRA Phase 2, Port Harcourt',
      note: 'Less pepper please',
      cardName: 'ADAEZE OKAFOR',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/29',
      cvv: '123',
    });
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number';
    if (deliveryType === 'delivery' && form.address.trim().length < 5) e.address = 'Enter your delivery address';
    if (form.cardName.trim().length < 2) e.cardName = 'Name on card is required';
    if (form.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Card number must be 16 digits';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY';
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = 'Invalid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings.isOpenForOrders || !validate()) return;

    setProcessing(true);
    for (let i = 0; i < processingSteps.length; i++) {
      setStep(i);
      await sleep(850);
    }

    const order = placeOrder({
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: deliveryType === 'pickup' ? 'Pickup at restaurant' : form.address.trim(),
      },
      items,
      deliveryType,
      note: form.note.trim() || undefined,
      cardLast4: form.cardNumber.replace(/\s/g, '').slice(-4),
      cardBrand: brand,
    });

    setStep(processingSteps.length);
    await sleep(700);
    navigate(`/order/${order.id}?placed=1`, { replace: true });
    clearCart();
  };

  return (
    <section className="container-x py-10">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Back to pack
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Checkout</h1>
          <p className="mt-2 text-ink-600">Almost there — just a few details and your food is on its way.</p>
        </div>
        <button type="button" onClick={fillDemo} className="btn-outline">
          <Wand2 className="size-4 text-brand-500" /> Fill demo details
        </button>
      </div>

      {!settings.isOpenForOrders && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm">
            <strong>We're currently not accepting orders.</strong> The kitchen is closed right now — please check back
            during our opening hours.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="card p-6 sm:p-8">
            <StepTitle n={1} title="Your details" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Adaeze Okafor" />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
              </Field>
              <Field label="Email address" error={errors.email} className="sm:col-span-2">
                <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
              </Field>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card p-6 sm:p-8">
            <StepTitle n={2} title="Delivery method" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { value: 'delivery' as const, icon: Bike, title: 'Home delivery', text: `${siteConfig.estimatedDelivery} · ${totals.subtotal >= settings.freeDeliveryThreshold ? 'Free' : formatPrice(settings.deliveryFee)}` },
                { value: 'pickup' as const, icon: Store, title: 'Pickup', text: 'Ready in ~25 min · Free' },
              ].map(({ value, icon: Icon, title, text }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setDeliveryType(value)}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition',
                    deliveryType === value ? 'border-brand-500 bg-brand-50' : 'border-ink-900/10 hover:border-ink-900/30',
                  )}
                >
                  <span className={cn('grid size-11 place-items-center rounded-xl', deliveryType === value ? 'bg-brand-500 text-white' : 'bg-cream-200')}>
                    <Icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink-900">{title}</span>
                    <span className="text-sm text-ink-500">{text}</span>
                  </span>
                  {deliveryType === value && <Check className="size-5 text-brand-500" />}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-4">
              {deliveryType === 'delivery' ? (
                <Field label="Delivery address" error={errors.address}>
                  <textarea rows={2} className="input resize-none" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="House number, street, area, landmark" />
                </Field>
              ) : (
                <div className="rounded-2xl bg-cream-100 p-4 text-sm">
                  <p className="font-semibold">Pickup location</p>
                  <p className="text-ink-600">{siteConfig.address}</p>
                </div>
              )}
              <Field label="Note for the kitchen (optional)">
                <input className="input" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. Less pepper, extra plantain" />
              </Field>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <StepTitle n={3} title="Payment" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-herb-600">
                <Lock className="size-3.5" /> SSL secured
              </span>
            </div>

            <div className="mt-6 grid items-start gap-6 md:grid-cols-[1fr_260px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name on card" error={errors.cardName} className="sm:col-span-2">
                  <input className="input uppercase" value={form.cardName} onChange={(e) => set('cardName', e.target.value)} placeholder="NAME SURNAME" />
                </Field>
                <Field label="Card number" error={errors.cardNumber} className="sm:col-span-2">
                  <div className="relative">
                    <input className="input pr-24 tracking-wider" inputMode="numeric" value={form.cardNumber} onChange={(e) => set('cardNumber', formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-ink-500">{form.cardNumber ? brand : ''}</span>
                  </div>
                </Field>
                <Field label="Expiry" error={errors.expiry}>
                  <input className="input" inputMode="numeric" value={form.expiry} onChange={(e) => set('expiry', formatExpiry(e.target.value))} placeholder="MM/YY" />
                </Field>
                <Field label="CVV" error={errors.cvv}>
                  <input className="input" inputMode="numeric" type="password" maxLength={4} value={form.cvv} onChange={(e) => set('cvv', e.target.value.replace(/\D/g, ''))} placeholder="•••" />
                </Field>
              </div>

              <CardPreview name={form.cardName} number={form.cardNumber} expiry={form.expiry} brand={brand} />
            </div>

            <p className="mt-5 flex items-center gap-2 rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-600">
              <CreditCard className="size-4 shrink-0" />
              Demo mode — no real charge is made. Use any 16-digit number, e.g. 4242 4242 4242 4242.
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold">Your order</h2>
          <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative">
                  <SmartImage src={item.image} alt={item.name} wrapperClassName="size-14 rounded-xl" />
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  {item.size && <p className="text-xs text-ink-500">{item.size}</p>}
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-3 border-t border-ink-900/10 pt-5 text-sm">
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            <Row
              label={deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
              value={totals.deliveryFee === 0 ? 'FREE' : formatPrice(totals.deliveryFee)}
              highlight={totals.deliveryFee === 0}
            />
            <div className="flex items-center justify-between border-t border-ink-900/10 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-3xl font-bold">{formatPrice(totals.total)}</span>
            </div>
          </div>
          <button type="submit" disabled={processing || !settings.isOpenForOrders} className="btn-primary mt-6 w-full py-4 text-base">
            <Lock className="size-4" /> Pay {formatPrice(totals.total)}
          </button>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="size-4 text-herb-600" /> Payments are encrypted and secure
          </div>
        </aside>
      </form>

      <ProcessingOverlay open={processing} step={step} total={formatPrice(totals.total)} />
    </section>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white">{n}</span>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-600">{label}</span>
      <span className={cn('font-semibold', highlight && 'text-herb-600')}>{value}</span>
    </div>
  );
}

function CardPreview({ name, number, expiry, brand }: { name: string; number: string; expiry: string; brand: string }) {
  const display = (number || '•••• •••• •••• ••••').padEnd(19, '•');
  return (
    <div className="relative hidden aspect-[1.6/1] overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 via-ink-900 to-brand-900 p-5 text-white shadow-xl md:block">
      <div className="absolute -top-10 -right-10 size-32 rounded-full bg-brand-500/30 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
          <span className="text-sm font-bold italic">{number ? brand : 'CARD'}</span>
        </div>
        <p className="font-mono text-base tracking-widest">{display}</p>
        <div className="flex justify-between text-[10px] uppercase">
          <div>
            <p className="text-white/50">Card holder</p>
            <p className="truncate text-xs font-semibold">{name || 'YOUR NAME'}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50">Expires</p>
            <p className="text-xs font-semibold">{expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingOverlay({ open, step, total }: { open: boolean; step: number; total: string }) {
  const done = step >= processingSteps.length;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
          >
            <div className={cn('mx-auto grid size-20 place-items-center rounded-full', done ? 'bg-herb-500' : 'bg-brand-50')}>
              {done ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="size-10 text-white" strokeWidth={3} />
                </motion.span>
              ) : (
                <Loader2 className="size-10 animate-spin text-brand-500" />
              )}
            </div>
            <h3 className="mt-6 text-2xl font-bold">{done ? 'Payment successful!' : 'Processing payment'}</h3>
            <p className="mt-1 text-sm text-ink-500">{done ? 'Redirecting to your order…' : `Charging ${total} — please don't close this page.`}</p>
            <ul className="mt-6 space-y-2 text-left">
              {processingSteps.map((label, i) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      'grid size-5 place-items-center rounded-full',
                      i < step || done ? 'bg-herb-500 text-white' : i === step ? 'bg-brand-100' : 'bg-cream-200',
                    )}
                  >
                    {i < step || done ? <Check className="size-3" strokeWidth={3} /> : i === step ? <Loader2 className="size-3 animate-spin text-brand-500" /> : null}
                  </span>
                  <span className={cn(i <= step || done ? 'text-ink-900' : 'text-ink-500')}>{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
