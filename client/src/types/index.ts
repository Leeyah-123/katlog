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
  _id: string;
  address: string;
  label: string;
  emailNotifications: boolean;
  actions: AccountAction[];
}
