import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
      )}
    >
      <div className={cn(align === 'center' && 'max-w-2xl')}>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className={cn('mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl', light && 'text-white')}>{title}</h2>
        {description && (
          <p className={cn('mt-4 text-base sm:text-lg', light ? 'text-white/70' : 'text-ink-600')}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
