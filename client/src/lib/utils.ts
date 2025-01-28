import { TransactionConfirmationStatus } from '@solana/web3.js';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string | undefined | null): string {
  if (!address) return 'Invalid Address';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const getTransactionStatusColor = (
  status: TransactionConfirmationStatus
) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-400/60';
    case 'finalized':
      return 'bg-green-500/60';
    case 'processed':
      return 'bg-blue-500/60';
    default:
      return 'bg-gray-500/60';
  }
};
