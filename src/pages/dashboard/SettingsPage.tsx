import { useState, type ReactNode } from 'react';
import { AlertTriangle, Bell, CreditCard, RotateCcw, Store, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';

export function SettingsPage() {
  const settings = useRestaurantStore((s) => s.settings);
  const updateSettings = useRestaurantStore((s) => s.updateSettings);
  const resetDemo = useRestaurantStore((s) => s.resetDemo);
  const clearCart = useCartStore((s) => s.clearCart);

  const [profile, setProfile] = useState<Record<'name' | 'phone' | 'email' | 'whatsapp' | 'address', string>>({
    name: siteConfig.name,
    phone: siteConfig.phone,
    email: siteConfig.email,
    whatsapp: `+${siteConfig.whatsapp}`,
    address: siteConfig.address,
  });
  const [fee, setFee] = useState(String(settings.deliveryFee));
  const [threshold, setThreshold] = useState(String(settings.freeDeliveryThreshold));
  const [confirmReset, setConfirmReset] = useState(false);

  const saveDelivery = () => {
    const deliveryFee = Number(fee);
    const freeDeliveryThreshold = Number(threshold);
    if (Number.isNaN(deliveryFee) || Number.isNaN(freeDeliveryThreshold)) return toast.error('Enter valid amounts');
    updateSettings({ deliveryFee, freeDeliveryThreshold });
    toast.success('Delivery settings saved', { description: 'Checkout now uses the new fees.' });
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your restaurant profile, delivery and notifications." />

      <div className="grid gap-6 xl:grid-cols-2">
        <Section icon={Store} title="Restaurant profile" description="Shown on your website and receipts.">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['name', 'Restaurant name'],
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['whatsapp', 'WhatsApp number'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="label">{label}</span>
                <input className="input" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="label">Address</span>
              <input className="input" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </label>
          </div>
          <button onClick={() => toast.success('Profile saved')} className="btn-dark mt-5">Save profile</button>
        </Section>

        <div className="space-y-6">
          <Section icon={Truck} title="Orders & delivery" description="These settings apply to checkout immediately.">
            <Row title="Accepting orders" text="Turn off to pause online ordering (e.g. when the kitchen is closed).">
              <Toggle
                checked={settings.isOpenForOrders}
                onChange={(v) => {
                  updateSettings({ isOpenForOrders: v });
                  toast(v ? 'Store is open for orders' : 'Online ordering paused');
                }}
              />
            </Row>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Delivery fee (USD)</span>
                <input className="input" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value.replace(/[^\d.]/g, ''))} />
              </label>
              <label className="block">
                <span className="label">Free delivery above (USD)</span>
                <input className="input" inputMode="decimal" value={threshold} onChange={(e) => setThreshold(e.target.value.replace(/[^\d.]/g, ''))} />
              </label>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              Currently: {formatPrice(settings.deliveryFee)} delivery, free on orders over {formatPrice(settings.freeDeliveryThreshold)}.
            </p>
            <button onClick={saveDelivery} className="btn-dark mt-4">Save delivery settings</button>
          </Section>

          <Section icon={Bell} title="Notifications">
            <div className="divide-y divide-ink-900/5">
              <Row title="Sound alert for new orders" text="Plays a chime when an order comes in.">
                <Toggle checked={settings.soundAlerts} onChange={(v) => updateSettings({ soundAlerts: v })} />
              </Row>
              <Row title="Email notifications" text={`Send order alerts to ${profile.email}.`}>
                <Toggle checked={settings.emailNotifications} onChange={(v) => updateSettings({ emailNotifications: v })} />
              </Row>
              <Row title="SMS notifications" text={`Text ${profile.phone} for every order.`}>
                <Toggle checked={settings.smsNotifications} onChange={(v) => updateSettings({ smsNotifications: v })} />
              </Row>
            </div>
          </Section>
        </div>

        <Section icon={CreditCard} title="Payment gateway" description="Where customer card payments are processed.">
          <div className="flex items-center gap-4 rounded-2xl border border-ink-900/5 p-4">
            <span className="grid size-12 place-items-center rounded-xl bg-[#011b33] text-lg font-black text-[#3bb75e]">P</span>
            <div className="flex-1">
              <p className="font-semibold">Paystack</p>
              <p className="text-xs text-ink-500">Accepts Visa, Mastercard & Verve · Settles in USD</p>
            </div>
            <span className="chip bg-amber-100 text-amber-800">Test mode</span>
          </div>
          <p className="mt-3 text-xs text-ink-500">In the live version this connects to Monica's real Paystack account so payouts go straight to her bank.</p>
        </Section>

        <Section icon={AlertTriangle} title="Demo data" description="Useful before presenting the demo." danger>
          <p className="text-sm text-ink-600">
            Restore the original menu, sample orders and settings. Any dishes you added and orders placed during testing will be removed.
          </p>
          <button onClick={() => setConfirmReset(true)} className="btn mt-4 bg-rose-600 text-white hover:bg-rose-700">
            <RotateCcw className="size-4" /> Reset demo data
          </button>
        </Section>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="Reset all demo data?"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmReset(false)} className="btn-ghost">Cancel</button>
            <button
              onClick={() => {
                resetDemo();
                clearCart();
                setFee('3.5');
                setThreshold('50');
                setConfirmReset(false);
                toast.success('Demo data restored');
              }}
              className="btn bg-rose-600 text-white hover:bg-rose-700"
            >
              Yes, reset
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">This restores the original menu, sample orders and settings.</p>
      </Modal>
    </>
  );
}

function Section({ icon: Icon, title, description, children, danger }: { icon: typeof Store; title: string; description?: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-2xl border bg-white p-6 shadow-sm ${danger ? 'border-rose-200' : 'border-ink-900/5'}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${danger ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-sans font-bold text-ink-900">{title}</h2>
          {description && <p className="text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{text}</p>
      </div>
      {children}
    </div>
  );
}
