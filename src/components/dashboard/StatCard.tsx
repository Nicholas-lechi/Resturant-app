import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  hint?: string;
  accent?: 'brand' | 'herb' | 'sky' | 'violet';
  index?: number;
}

const accents = {
  brand: 'bg-brand-50 text-brand-600',
  herb: 'bg-herb-50 text-herb-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function StatCard({ label, value, icon: Icon, change, hint, accent = 'brand', index = 0 }: StatCardProps) {
  const positive = (change ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={cn('grid size-10 place-items-center rounded-xl', accents[accent])}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink-900 tabular-nums">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {positive ? '+' : ''}
            {change}%
          </span>
        )}
        {hint && <span className="text-ink-500">{hint}</span>}
      </div>
    </motion.div>
  );
}
