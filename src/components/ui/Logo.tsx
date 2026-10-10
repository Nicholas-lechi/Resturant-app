import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-10', className)} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#f95d12" />
      <path d="M14 31h36a18 18 0 0 1-36 0Z" fill="#fff" />
      <path
        d="M24 23c0-4 4-4 4-8M32 23c0-4 4-4 4-8M40 23c0-4 4-4 4-8"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ light = false, to = '/' }: { light?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={cn('block font-display text-xl font-bold', light ? 'text-white' : 'text-ink-900')}>
          Monica's
        </span>
        <span
          className={cn(
            'block text-[10px] font-bold tracking-[0.3em] uppercase',
            light ? 'text-brand-300' : 'text-brand-500',
          )}
        >
          Kitchen
        </span>
      </span>
    </Link>
  );
}
