import { TransactionConfirmationStatus } from '@solana/web3.js';

export const NETWORKS = ['Mainnet', 'Devnet', 'Testnet'] as const;
export type Network = (typeof NETWORKS)[number];

export type AccountAction = {
  signature: string;
  from: string;
  to: string;
  amount?: number;
  action: 'Token Transfer' | 'Sol Transfer' | 'Other';
  timestamp: string;
  success: boolean;
  network: Network;
  status?: TransactionConfirmationStatus;
  lastStatusCheck?: number;
};

export type WatchlistItem = {
  _id: string;
  address: string;
  label: string;
  watchedNetworks: Network[];
  emailNotifications: boolean;
  actions: AccountAction[];
};

export type ValidationResult = {
  valid: boolean;
  error?: string;
};
