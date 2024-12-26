export interface AccountAction {
  signature: string;
  slot: number;
  timestamp: string;
  programId: string;
  voteAccount: string;
  voteAuthority: string;
  preBalance: number;
  postBalance: number;
  balanceChange: number;
  success: boolean;
}

export interface WatchlistItem {
  address: string;
  label: string;
  actions: AccountAction[];
}
