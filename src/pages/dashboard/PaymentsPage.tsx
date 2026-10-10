import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, Banknote, CalendarClock, Download, RotateCcw, Search, ShieldCheck, Wallet, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentStatus } from '@/types';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn, formatCompact, formatDate, formatPrice, roundMoney } from '@/lib/utils';
import { PageHeader, Panel } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { PaymentStatusBadge } from '@/components/ui/Badges';

const PROCESSING_FEE = 0.015; // 1.5% gateway fee, for illustration

export function PaymentsPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all');

  const stats = useMemo(() => {
    const sum = (s: PaymentStatus) => roundMoney(orders.filter((o) => o.paymentStatus === s).reduce((a, o) => a + o.total, 0));
    const received = sum('paid');
    const fees = roundMoney(received * PROCESSING_FEE);
    const byBrand = ['Visa', 'Mastercard', 'Verve'].map((brand) => ({
      brand,
      amount: roundMoney(orders.filter((o) => o.paymentStatus === 'paid' && o.cardBrand === brand).reduce((a, o) => a + o.total, 0)),
    }));
    return {
      received,
      refunded: sum('refunded'),
      failed: sum('failed'),
      failedCount: orders.filter((o) => o.paymentStatus === 'failed').length,
      refundedCount: orders.filter((o) => o.paymentStatus === 'refunded').length,
      fees,
      net: roundMoney(received - fees),
      byBrand,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === 'all' || o.paymentStatus === status) &&
        (!q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.cardLast4.includes(q)),
    );
  }, [orders, query, status]);

  const exportCsv = () => {
    const rows = [
      ['Transaction', 'Order', 'Date', 'Customer', 'Email', 'Method', 'Amount (USD)', 'Status'],
      ...filtered.map((o) => [
        `TXN-${o.id.slice(3)}${o.cardLast4}`,
        o.id,
        new Date(o.createdAt).toISOString(),
        o.customer.name,
        o.customer.email,
        `${o.cardBrand} ****${o.cardLast4}`,
        o.total.toFixed(2),
        o.paymentStatus,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `monicas-kitchen-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions`);
  };

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every card payment taken through your website."
        actions={
          <button onClick={exportCsv} className="btn-outline py-2.5">
            <Download className="size-4" /> Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total received" value={formatPrice(stats.received)} icon={ArrowDownLeft} accent="herb" hint="Successful payments" />
        <StatCard index={1} label="Net after fees" value={formatPrice(stats.net)} icon={Wallet} hint={`${formatPrice(stats.fees)} gateway fees`} />
        <StatCard index={2} label="Refunded" value={formatPrice(stats.refunded)} icon={RotateCcw} accent="violet" hint={`${stats.refundedCount} refunds`} />
        <StatCard index={3} label="Failed" value={formatPrice(stats.failed)} icon={XCircle} accent="sky" hint={`${stats.failedCount} declined`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Next payout" className="bg-gradient-to-br from-ink-900 to-ink-800 text-white">
          <div className="p-5 pt-3">
            <p className="text-sm text-white/60">Scheduled to your bank account</p>
            <p className="mt-2 font-display text-4xl font-bold text-white">{formatPrice(roundMoney(stats.net * 0.12))}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3"><CalendarClock className="size-4 text-brand-300" /> Tomorrow, 9:00 AM</div>
              <div className="flex items-center gap-3"><Banknote className="size-4 text-brand-300" /> Business account •••• 4821</div>
              <div className="flex items-center gap-3"><ShieldCheck className="size-4 text-brand-300" /> Gateway: Paystack (test mode)</div>
            </div>
          </div>
        </Panel>

        <Panel title="Revenue by card type" className="xl:col-span-2">
          <div className="h-60 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byBrand} barSize={48} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="4 4" />
                <XAxis dataKey="brand" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#57534e' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v: number) => formatCompact(v)} width={56} />
                <Tooltip cursor={{ fill: '#fdf8ee' }} formatter={(v) => [formatPrice(Number(v)), 'Revenue']} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="amount" fill="#f95d12" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-900/5 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-ink-900/5 p-4 sm:flex-row sm:items-center">
          <h2 className="font-sans font-bold">Transactions</h2>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Order, customer, last 4" className="input py-2.5 pl-10" />
          </div>
          <div className="flex rounded-xl bg-cream-100 p-1 text-xs font-semibold">
            {(['all', 'paid', 'refunded', 'failed'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={cn('rounded-lg px-3 py-1.5 capitalize transition', status === s ? 'bg-white shadow-sm' : 'text-ink-500')}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 bg-cream-50">
              <tr className="text-left text-xs text-ink-500">
                <th className="px-5 py-3 font-semibold">Transaction</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Method</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/dashboard/orders?open=${o.id}`)} className="cursor-pointer hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-semibold text-ink-900">TXN-{o.id.slice(3)}{o.cardLast4}</p>
                    <p className="text-xs text-ink-500">Order #{o.id}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{o.customer.name}</p>
                    <p className="text-xs text-ink-500">{o.customer.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2">
                      <CardBrand brand={o.cardBrand} /> •••• {o.cardLast4}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-ink-600">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                  <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', o.paymentStatus !== 'paid' && 'text-ink-500 line-through')}>
                    {formatPrice(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CardBrand({ brand }: { brand: string }) {
  const styles: Record<string, string> = {
    Visa: 'bg-[#1a1f71] text-white',
    Mastercard: 'bg-[#eb001b] text-white',
    Verve: 'bg-[#00425f] text-white',
    Amex: 'bg-[#2e77bb] text-white',
  };
  return <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold italic', styles[brand] ?? 'bg-ink-900 text-white')}>{brand.toUpperCase()}</span>;
}
