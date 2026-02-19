import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function isUpcoming(date: string | Date): boolean {
  return new Date(date) > new Date();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    attending: 'bg-green-100 text-green-800',
    maybe: 'bg-yellow-100 text-yellow-800',
    declined: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.pending;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
