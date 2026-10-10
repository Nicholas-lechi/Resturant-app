import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { cn, formatPrice, getInitials, timeAgo } from '@/lib/utils';
import { playNewOrderSound } from '@/lib/sound';

const nav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/dashboard/products', label: 'Products', icon: UtensilsCrossed },
  { to: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setSidebarOpen(false), [location.pathname]);
  useNewOrderAlerts();

  return (
    <div className="min-h-screen bg-[#f6f5f3]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink-950/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-72"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pending = useRestaurantStore((s) => s.orders.filter((o) => o.status === 'pending').length);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-ink-950 text-white/70">
      <div className="flex items-center justify-between px-6 py-6">
        <Logo light to="/dashboard" />
        {onClose && (
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close menu">
            <X className="size-5" />
          </button>
        )}
      </div>

      <p className="px-6 pb-2 text-[11px] font-bold tracking-widest text-white/40 uppercase">Manage</p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-brand-500 text-white shadow-glow' : 'hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="size-5" />
            <span className="flex-1">{label}</span>
            {label === 'Orders' && pending > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-bold text-brand-600">
                {pending}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 p-4">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold hover:bg-white/5 hover:text-white"
        >
          View website <ExternalLink className="size-4" />
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand-500 font-bold text-white">
            {getInitials(user?.name ?? 'M')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs">Owner</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/dashboard/login');
            }}
            className="rounded-lg p-2 hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const orders = useRestaurantStore((s) => s.orders);
  const settings = useRestaurantStore((s) => s.settings);
  const updateSettings = useRestaurantStore((s) => s.updateSettings);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const alerts = orders.filter((o) => o.status === 'pending').slice(0, 6);
  const newCount = orders.filter((o) => o.isNew).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-900/5 bg-[#f6f5f3]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="rounded-xl p-2 hover:bg-white lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <p className="hidden text-sm text-ink-500 sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              updateSettings({ isOpenForOrders: !settings.isOpenForOrders });
              toast(settings.isOpenForOrders ? 'Store closed — customers can no longer check out' : 'Store is open for orders');
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition',
              settings.isOpenForOrders ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
            )}
            title="Toggle store open / closed"
          >
            <span className={cn('size-2 rounded-full', settings.isOpenForOrders ? 'animate-pulse bg-emerald-500' : 'bg-rose-500')} />
            {settings.isOpenForOrders ? 'Open for orders' : 'Closed'}
          </button>

          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative grid size-10 place-items-center rounded-full bg-white shadow-sm hover:bg-cream-100"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {(newCount || alerts.length) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {newCount || alerts.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-2xl"
                >
                  <div className="border-b border-ink-900/5 px-4 py-3">
                    <p className="font-semibold text-ink-900">Orders waiting</p>
                    <p className="text-xs text-ink-500">{alerts.length} pending order{alerts.length === 1 ? '' : 's'}</p>
                  </div>
                  <ul className="max-h-80 divide-y divide-ink-900/5 overflow-y-auto">
                    {alerts.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-500">All caught up 🎉</li>}
                    {alerts.map((o) => (
                      <li key={o.id}>
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate(`/dashboard/orders?open=${o.id}`);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream-50"
                        >
                          <span className="grid size-9 place-items-center rounded-full bg-amber-100 text-amber-700">
                            <ShoppingBag className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {o.customer.name} · {formatPrice(o.total)}
                            </span>
                            <span className="text-xs text-ink-500">
                              #{o.id} · {timeAgo(o.createdAt)}
                            </span>
                          </span>
                          {o.isNew && <span className="chip bg-brand-500 px-2 py-0.5 text-[10px] text-white">NEW</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/dashboard/orders"
                    onClick={() => setOpen(false)}
                    className="block border-t border-ink-900/5 px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-cream-50"
                  >
                    View all orders
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Shows a toast (and plays a sound) when a new order arrives from the website — even from another tab. */
function useNewOrderAlerts() {
  const orders = useRestaurantStore((s) => s.orders);
  const soundAlerts = useRestaurantStore((s) => s.settings.soundAlerts);
  const navigate = useNavigate();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = orders.filter((o) => !seen.current!.has(o.id));
    fresh.forEach((o) => {
      seen.current!.add(o.id);
      if (soundAlerts) playNewOrderSound();
      toast.success(`New order #${o.id}`, {
        description: `${o.customer.name} · ${formatPrice(o.total)} · ${o.items.length} item(s)`,
        duration: 8000,
        action: { label: 'View', onClick: () => navigate(`/dashboard/orders?open=${o.id}`) },
      });
    });
  }, [orders, soundAlerts, navigate]);
}
