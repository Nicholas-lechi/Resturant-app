import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { siteConfig } from '@/config/site';
import type { DeliveryType, OrderStatus, PaymentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: siteConfig.currency,
});

export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: siteConfig.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export interface DeliveryRules {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export function calculateTotals(
  subtotal: number,
  deliveryType: DeliveryType,
  rules: DeliveryRules = siteConfig,
) {
  const deliveryFee =
    deliveryType === 'pickup' || subtotal === 0 || subtotal >= rules.freeDeliveryThreshold
      ? 0
      : rules.deliveryFee;
  return {
    subtotal: roundMoney(subtotal),
    deliveryFee,
    total: roundMoney(subtotal + deliveryFee),
  };
}

export function formatDate(iso: string, withTime = true) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(iso));
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function generateOrderId() {
  return `MK-${Math.floor(20000 + Math.random() * 79999)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  preparing: { label: 'Preparing', className: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  out_for_delivery: { label: 'Out for delivery', className: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-800' },
  refunded: { label: 'Refunded', className: 'bg-slate-200 text-slate-700' },
  failed: { label: 'Failed', className: 'bg-rose-100 text-rose-800' },
};

export const orderStatusFlow: OrderStatus[] = ['pending', 'preparing', 'out_for_delivery', 'delivered'];

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = orderStatusFlow.indexOf(status);
  if (index === -1 || index === orderStatusFlow.length - 1) return null;
  return orderStatusFlow[index + 1];
}

export const nextStatusAction: Partial<Record<OrderStatus, string>> = {
  pending: 'Accept & start preparing',
  preparing: 'Send out for delivery',
  out_for_delivery: 'Mark as delivered',
};

export function detectCardBrand(cardNumber: string) {
  const n = cardNumber.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(506|507|650)/.test(n)) return 'Verve';
  return 'Card';
}

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
