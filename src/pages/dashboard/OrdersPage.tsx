import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, Inbox, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn, formatPrice, nextStatus, orderStatusMeta, timeAgo } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { OrderDetailsDrawer } from '@/components/dashboard/OrderDetailsDrawer';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badges';
import { EmptyState } from '@/components/ui/EmptyState';

const tabs: (OrderStatus | 'all')[] = ['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const PAGE_SIZE = 12;

export function OrdersPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const updateOrderStatus = useRestaurantStore((s) => s.updateOrderStatus);
  const markOrderSeen = useRestaurantStore((s) => s.markOrderSeen);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const status = (params.get('status') as OrderStatus | null) ?? 'all';
  const openId = params.get('open');
  const openOrder = orders.find((o) => o.id === openId) ?? null;

  useEffect(() => {
    if (openOrder?.isNew) markOrderSeen(openOrder.id);
  }, [openOrder, markOrderSeen]);

  useEffect(() => setPage(1), [status, query]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    orders.forEach((o) => (map[o.status] = (map[o.status] ?? 0) + 1));
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === 'all' || o.status === status) &&
        (!q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q)),
    );
  }, [orders, status, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Orders" description="Accept new orders and move them through the kitchen to delivery." />

      <div className="rounded-2xl border border-ink-900/5 bg-white shadow-sm">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink-900/5 px-3 pt-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setParam('status', t)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition',
                status === t ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {t === 'all' ? 'All orders' : orderStatusMeta[t].label}
              <span className={cn('rounded-full px-2 py-0.5 text-[11px]', status === t ? 'bg-brand-100 text-brand-700' : 'bg-cream-200 text-ink-600')}>
                {counts[t] ?? 0}
              </span>
              {status === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order #, name or phone" className="input py-2.5 pl-10" />
          </div>
          <p className="text-sm text-ink-500">{filtered.length} orders</p>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={Inbox} title="No orders here" description="Orders matching this filter will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-y border-ink-900/5 bg-cream-50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {visible.map((o) => {
                  const next = nextStatus(o.status);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setParam('open', o.id)}
                      className={cn('cursor-pointer transition hover:bg-cream-50', o.isNew && 'bg-brand-50/60')}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink-900">
                          #{o.id}
                          {o.isNew && <span className="chip ml-2 bg-brand-500 px-1.5 py-0 text-[10px] text-white">NEW</span>}
                        </p>
                        <p className="text-xs text-ink-500">{timeAgo(o.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-ink-900">{o.customer.name}</p>
                        <p className="text-xs text-ink-500">{o.customer.phone}</p>
                      </td>
                      <td className="max-w-[220px] px-3 py-3.5">
                        <p className="truncate text-ink-700">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                        <p className="text-xs text-ink-500 capitalize">{o.deliveryType}</p>
                      </td>
                      <td className="px-3 py-3.5 font-semibold">{formatPrice(o.total)}</td>
                      <td className="px-3 py-3.5"><PaymentStatusBadge status={o.paymentStatus} /></td>
                      <td className="px-3 py-3.5"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        {next ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(o.id, next);
                              toast.success(`#${o.id} → ${orderStatusMeta[next].label}`);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
                          >
                            {o.status === 'pending' ? 'Accept' : orderStatusMeta[next].label}
                            <ChevronRight className="size-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-ink-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-ink-900/5 px-5 py-3 text-sm">
            <p className="text-ink-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-outline px-4 py-2">Previous</button>
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-4 py-2">Next</button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsDrawer order={openOrder} onClose={() => setParam('open', null)} />
    </>
  );
}
