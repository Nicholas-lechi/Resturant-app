import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({ value, reviews, className }: { value: number; reviews?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-ink-900">{value.toFixed(1)}</span>
      {reviews !== undefined && <span className="text-ink-500">({reviews})</span>}
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('size-4', i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-ink-900/15')}
        />
      ))}
    </span>
  );
}
