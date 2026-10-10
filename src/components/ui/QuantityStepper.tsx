import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md' }: Props) {
  const btn = size === 'sm' ? 'size-7' : 'size-10';
  return (
    <div className="inline-flex items-center rounded-full border border-ink-900/10 bg-white p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min - 1, value - 1))}
        disabled={value <= min - 1}
        className={cn(btn, 'grid place-items-center rounded-full text-ink-800 transition hover:bg-cream-200')}
      >
        <Minus className="size-4" />
      </button>
      <span className={cn('text-center font-semibold tabular-nums', size === 'sm' ? 'w-7 text-sm' : 'w-10')}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(btn, 'grid place-items-center rounded-full bg-ink-900 text-white transition hover:bg-brand-500')}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
