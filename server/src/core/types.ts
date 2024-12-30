import { StatusCodes } from 'http-status-codes';

export type ServiceResponse<T = any> = {
  status?: StatusCodes;
  message?: string;
  data?: T;
};

export type AccountAction = {
  signature: string;
  from: string;
  to: string;
  amount?: number;
  action: 'Token Transfer' | 'Sol Transfer' | 'Other';
  timestamp: string;
  success: boolean;
};

export type WatchlistItem = {
  address: string;
  label: string;
  emailNotifications: boolean;
  actions: AccountAction[];
};

export type Watchlist = {
  userId: string;
  items: WatchlistItem[];
};

export type User = {
  _id?: string;
  email?: string;
  walletAddress: string;
};
