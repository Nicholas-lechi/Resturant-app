import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Bike, ChefHat, ClipboardList, DollarSign, Plus, Receipt, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn, formatCompact, formatPrice, timeAgo } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { Panel } from '@/components/dashboard/PageHeader';
import { OrderStatusBadge } from '@/components/ui/Badges';
import { SmartImage } from '@/components/ui/SmartImage';

const pieColors = ['#f95d12', '#1c1917', '#ff9a5c', '#78716c', '#ffd0a8', '#3f9d5b', '#c22f09'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function OverviewPage() {
  const user = useAuthStore((s) => s.user);
  const data = useDashboardData();
  const [range, setRange] = useState<7 | 30>(30);
  const chartData = data.daily.slice(-range);
  const rangeRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalCategory = data.byCategory.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting()}, {user?.name} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-500">Here's what's happening in your kitchen today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/orders" className="btn-outline py-2.5">
            <ClipboardList className="size-4" /> Manage orders
          </Link>
          <Link to="/dashboard/products?new=1" className="btn-primary py-2.5">
            <Plus className="size-4" /> Add dish
          </Link>
        </div>
      </div>

      {/* Live kitchen strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'New / pending', value: data.pending, icon: ShoppingBag, className: 'from-amber-400 to-amber-500', status: 'pending' },
          { label: 'In the kitchen', value: data.preparing, icon: ChefHat, className: 'from-sky-500 to-sky-600', status: 'preparing' },
          { label: 'Out for delivery', value: data.outForDelivery, icon: Bike, className: 'from-violet-500 to-violet-600', status: 'out_for_delivery' },
        ].map(({ label, value, icon: Icon, className, status }) => (
          <Link
            key={label}
            to={`/dashboard/orders?status=${status}`}
            className={cn('group flex items-center gap-4 rounded-2xl bg-gradient-to-br p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg', className)}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-white/20">
              <Icon className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-white/85">{label}</p>
            </div>
            <ArrowRight className="size-5 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total revenue (30d)" value={formatPrice(data.revenue)} icon={DollarSign} change={data.revenueChange} hint="vs previous 15 days" />
        <StatCard index={1} label="Total orders" value={data.totalOrders.toLocaleString()} icon={Receipt} change={data.ordersChange} hint="vs previous 15 days" accent="sky" />
        <StatCard index={2} label="Orders today" value={String(data.todayCount)} icon={ShoppingBag} change={data.todayChange} hint={`${formatPrice(data.todayRevenue)} earned`} accent="herb" />
        <StatCard index={3} label="Avg. order value" value={formatPrice(data.avgOrder)} icon={TrendingUp} change={data.avgChange} hint="per paid order" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Revenue"
          description={`${formatPrice(rangeRevenue)} in the last ${range} days`}
          action={
            <div className="flex rounded-full bg-cream-100 p-1 text-xs font-semibold">
              {([7, 30] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn('rounded-full px-3 py-1.5 transition', range === r ? 'bg-white shadow-sm' : 'text-ink-500')}
                >
                  {r} days
                </button>
              ))}
            </div>
          }
        >
          <div className="h-72 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f95d12" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#f95d12" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="4 4" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#78716c' }} interval={range === 30 ? 4 : 0} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v: number) => formatCompact(v)} width={56} />
                <Tooltip
                  cursor={{ stroke: '#f95d12', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #f1dfbf', boxShadow: '0 10px 30px -12px rgb(0 0 0 / .2)', fontSize: 12 }}
                  formatter={(value, name) => [name === 'revenue' ? formatPrice(Number(value)) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f95d12" strokeWidth={2.5} fill="url(#rev)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sales by category" description="Share of paid revenue">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                  {data.byCategory.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xs text-ink-500">Total</p>
                <p className="text-lg font-bold">{formatCompact(totalCategory)}</p>
              </div>
            </div>
          </div>
          <ul className="space-y-2 px-5 pb-5">
            {data.byCategory.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span className="flex-1 text-ink-700">{c.name}</span>
                <span className="font-semibold tabular-nums">{Math.round((c.value / totalCategory) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Recent orders"
          description="Latest orders from the website"
          action={
            <Link to="/dashboard/orders" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          }
        >
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-ink-900/5 bg-cream-50 text-left text-xs text-ink-500">
                  <th className="px-5 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Total</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {data.recent.map((o) => (
                  <tr key={o.id} className="transition hover:bg-cream-50">
                    <td className="px-5 py-3">
                      <Link to={`/dashboard/orders?open=${o.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                        #{o.id}
                      </Link>
                      {o.isNew && <span className="chip ml-2 bg-brand-500 px-1.5 py-0 text-[10px] text-white">NEW</span>}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink-900">{o.customer.name}</p>
                      <p className="text-xs text-ink-500">{o.items.reduce((s, i) => s + i.quantity, 0)} items · {o.deliveryType}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right text-ink-500">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Top selling dishes" description="All-time units sold">
          <ul className="space-y-4 p-5">
            {data.topProducts.map((p, i) => {
              const max = data.topProducts[0].soldCount;
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-bold text-ink-500">{i + 1}</span>
                  <SmartImage src={p.image} alt={p.name} wrapperClassName="size-11 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <span className="text-xs font-semibold text-ink-500 tabular-nums">{p.soldCount.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(p.soldCount / max) * 100}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
