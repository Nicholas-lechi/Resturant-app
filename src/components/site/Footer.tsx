import { Link } from 'react-router-dom';
import { Clock, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { siteConfig } from '@/config/site';
import { categories } from '@/data/categories';
import { SocialIcons } from './SocialIcons';

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-ink-950 text-white/70">
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{siteConfig.description}</p>
          <SocialIcons className="mt-6" />
        </div>

        <div>
          <h4 className="font-sans text-sm font-bold tracking-widest text-white uppercase">Menu</h4>
          <ul className="mt-5 space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/menu?category=${c.id}`} className="transition hover:text-brand-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-sm font-bold tracking-widest text-white uppercase">Opening Hours</h4>
          <ul className="mt-5 space-y-4 text-sm">
            {siteConfig.openingHours.map((o) => (
              <li key={o.days} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>
                  <span className="block font-semibold text-white">{o.days}</span>
                  {o.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-sm font-bold tracking-widest text-white uppercase">Contact</h4>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
              {siteConfig.address}
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className="hover:text-brand-300">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-brand-300">
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 hover:text-brand-300">
            <Lock className="size-3.5" /> Owner login
          </Link>
        </div>
      </div>
    </footer>
  );
}
