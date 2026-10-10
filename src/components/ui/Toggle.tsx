import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'size-4' : 'size-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors',
        track,
        checked ? 'bg-herb-500' : 'bg-ink-900/20',
      )}
    >
      <span className={cn('rounded-full bg-white shadow transition-transform', knob, checked ? shift : 'translate-x-0')} />
    </button>
  );
}
