import type { OrderStatus, PaymentStatus } from '@/types';
import { cn, orderStatusMeta, paymentStatusMeta } from '@/lib/utils';

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = orderStatusMeta[status];
  return (
    <span className={cn('chip whitespace-nowrap', meta.className, className)}>
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[status];
  return <span className={cn('chip', meta.className)}>{meta.label}</span>;
}
