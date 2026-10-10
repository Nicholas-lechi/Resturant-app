import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, MapPin, Phone, Repeat, Search, UserPlus, Users } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { formatDate, formatPrice, getInitials, roundMoney, timeAgo } from '@/lib/utils';
import type { Order } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Modal } from '@/components/ui/Modal';
import { OrderStatusBadge } from '@/components/ui/Badges';

interface CustomerSummary {
  key: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orders: Order[];
  spent: number;
  lastOrder: string;
}

const avatarColors = ['bg-brand-100 text-brand-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];

export function CustomersPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((o) => {
      const key = o.customer.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orders.push(o);
        if (o.paymentStatus === 'paid') existing.spent = roundMoney(existing.spent + o.total);
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
        if (o.deliveryType === 'delivery' && existing.address === 'Pickup at restaurant') existing.address = o.customer.address;
      } else {
        map.set(key, {
          key,
          name: o.customer.name,
          email: o.customer.email,
          phone: o.customer.phone,
          address: o.customer.address,
          orders: [o],
          spent: o.paymentStatus === 'paid' ? o.total : 0,
          lastOrder: o.createdAt,
        });
      }
    });
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.includes(q) || c.phone.includes(q);
  });

  const repeat = customers.filter((c) => c.orders.length > 1).length;
  const newThisMonth = customers.filter((c) => Date.now() - new Date(c.orders[c.orders.length - 1].createdAt).getTime() < 7 * 86_400_000).length;
  const avgSpend = customers.length ? roundMoney(customers.reduce((s, c) => s + c.spent, 0) / customers.length) : 0;

  return (
    <>
      <PageHeader title="Customers" description="Everyone who has ordered from your website." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total customers" value={String(customers.length)} icon={Users} />
        <StatCard index={1} label="Repeat customers" value={String(repeat)} icon={Repeat} accent="herb" hint={`${Math.round((repeat / Math.max(1, customers.length)) * 100)}% come back`} />
        <StatCard index={2} label="Active this week" value={String(newThisMonth)} icon={UserPlus} accent="sky" />
        <StatCard index={3} label="Avg. lifetime spend" value={formatPrice(avgSpend)} icon={Crown} accent="violet" />
      </div>

      <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-ink-900/5 p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or phone" className="input py-2.5 pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-cream-50 text-left text-xs text-ink-500">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Phone</th>
                <th className="px-3 py-3 font-semibold">Orders</th>
                <th className="px-3 py-3 font-semibold">Total spent</th>
                <th className="px-5 py-3 text-right font-semibold">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {filtered.map((c, i) => (
                <tr key={c.key} onClick={() => setSelected(c)} className="cursor-pointer hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(c.name)}
                      </span>
                      <div>
                        <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                          {c.name}
                          {i < 3 && !query && <Crown className="size-3.5 text-amber-500" />}
                        </p>
                        <p className="text-xs text-ink-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-700">{c.phone}</td>
                  <td className="px-3 py-3">{c.orders.length}</td>
                  <td className="px-3 py-3 font-semibold">{formatPrice(c.spent)}</td>
                  <td className="px-5 py-3 text-right text-ink-500">{timeAgo(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} size="lg" title={selected?.name} description={selected ? `Customer since ${formatDate(selected.orders[selected.orders.length - 1].createdAt, false)}` : ''}>
        {selected && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-cream-50 p-4"><p className="text-xs text-ink-500">Orders</p><p className="text-2xl font-bold">{selected.orders.length}</p></div>
              <div className="rounded-2xl bg-cream-50 p-4"><p className="text-xs text-ink-500">Total spent</p><p className="text-2xl font-bold">{formatPrice(selected.spent)}</p></div>
              <div className="rounded-2xl bg-cream-50 p-4"><p className="text-xs text-ink-500">Avg. order</p><p className="text-2xl font-bold">{formatPrice(roundMoney(selected.spent / selected.orders.length))}</p></div>
            </div>
            <ul className="space-y-2 text-sm text-ink-700">
              <li className="flex items-center gap-2"><Mail className="size-4 text-ink-500" /> {selected.email}</li>
              <li className="flex items-center gap-2"><Phone className="size-4 text-ink-500" /> {selected.phone}</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-ink-500" /> {selected.address}</li>
            </ul>
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-500 uppercase">Order history</p>
              <ul className="divide-y divide-ink-900/5 rounded-2xl border border-ink-900/5">
                {selected.orders.map((o) => (
                  <li key={o.id}>
                    <button onClick={() => navigate(`/dashboard/orders?open=${o.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-cream-50">
                      <span className="font-semibold">#{o.id}</span>
                      <span className="flex-1 truncate text-ink-500">{o.items.map((i) => i.name).join(', ')}</span>
                      <OrderStatusBadge status={o.status} />
                      <span className="w-20 text-right font-semibold">{formatPrice(o.total)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
