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
  action: string;
  timestamp: number;
  success: boolean;
};

export type WatchlistItem = {
  address: string;
  label: string;
  actions: AccountAction[];
};

export type Watchlist = {
  userId: string;
  items: WatchlistItem[];
};

export type User = {
  _id: string;
  email: string;
};
