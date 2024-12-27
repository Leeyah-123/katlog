import { config } from '../../config';
import { AccountAction, Watchlist } from '../../core/types';

export class WatchlistService {
  async getAllWatchlists(): Promise<Watchlist[]> {
    // Fetch all watchlists from main server
    const response = await fetch(`${config.mainServerUrl}/api/watchlists`);
    const watchlists = await response.json();
    return watchlists;
  }

  async checkWatchedAddresses(transaction: AccountAction): Promise<string[]> {
    const watchlists = await this.getAllWatchlists();
    const notifyUserIds: string[] = [];

    for (const watchlist of watchlists) {
      const watchedAddresses = watchlist.items.map((item) => item.address);
      if (
        watchedAddresses.includes(transaction.from) ||
        watchedAddresses.includes(transaction.to)
      ) {
        notifyUserIds.push(watchlist.userId);
      }
    }

    return notifyUserIds;
  }
}
