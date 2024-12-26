export interface AccountAction {
  signature: string;
  from: string;
  to: string;
  amount?: number;
  action: 'Token Transfer' | 'Sol Transfer' | 'Other';
  timestamp: string;
  success: boolean;
}

export interface WatchlistItem {
  address: string;
  label: string;
  actions: AccountAction[];
}
