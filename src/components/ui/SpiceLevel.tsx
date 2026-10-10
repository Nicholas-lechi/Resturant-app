import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const labels = ['Not spicy', 'Mild', 'Medium', 'Hot'];

export function SpiceLevel({ level, showLabel = false }: { level: 0 | 1 | 2 | 3; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {[1, 2, 3].map((i) => (
          <Flame
            key={i}
            className={cn('size-4', i <= level ? 'fill-brand-500 text-brand-500' : 'text-ink-900/15')}
          />
        ))}
      </span>
      {showLabel && <span className="text-sm text-ink-700">{labels[level]}</span>}
    </span>
  );
}
