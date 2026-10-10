import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Menu as MenuIcon, Search, ShoppingBag, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { selectCartCount, useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/#about', label: 'About' },
  { to: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const count = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const settings = useRestaurantStore((s) => s.settings);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname, location.hash]);

  // Scroll to #about / #contact when navigating with a hash
  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [location]);

  return (
    <>
      <div className="bg-ink-900 text-center text-xs font-medium text-white/80">
        <div className="container-x py-2">
          {settings.isOpenForOrders
            ? `🔥 Free delivery on orders above $${settings.freeDeliveryThreshold} · Open today ${siteConfig.openingHours[0].hours}`
            : '⏸️ We’re not taking online orders right now — please check back soon'}
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-ink-900/5 bg-cream-50/85 shadow-sm backdrop-blur-xl' : 'bg-cream-50',
        )}
      >
        <nav className="container-x flex h-18 items-center justify-between gap-4 py-3">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive && !link.to.includes('#')
                        ? 'bg-ink-900 text-white'
                        : 'text-ink-700 hover:bg-cream-200 hover:text-ink-900',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              to="/menu"
              className="hidden size-11 place-items-center rounded-full text-ink-800 hover:bg-cream-200 sm:grid"
              aria-label="Search the menu"
            >
              <Search className="size-5" />
            </Link>
            <button
              onClick={openCart}
              className="relative grid size-11 place-items-center rounded-full bg-white text-ink-900 shadow-soft transition hover:bg-cream-200"
              aria-label="Open your pack"
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link to="/menu" className="btn-primary hidden lg:inline-flex">
              Order Now
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-full hover:bg-cream-200 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink-900/5 bg-cream-50 md:hidden"
            >
              <ul className="container-x space-y-1 py-4">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="block rounded-2xl px-4 py-3 font-semibold hover:bg-cream-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-ink-600 hover:bg-cream-200"
                  >
                    <LayoutDashboard className="size-4" /> Owner login
                  </Link>
                </li>
                <li className="pt-2">
                  <Link to="/menu" className="btn-primary w-full">
                    Order Now
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
