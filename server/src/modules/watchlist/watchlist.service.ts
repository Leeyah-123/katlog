import { config } from '../../config';
import { AccountAction, Watchlist } from '../../core/types';

export class WatchlistService {
  async getAllWatchlists(token: string): Promise<Watchlist[]> {
    // Fetch all watchlists from main server
    const response = await fetch(`${config.mainServerUrl}/api/watchlists`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const watchlists = await response.json();
    return watchlists;
  }

  async checkWatchedAddresses(
    transaction: AccountAction,
    token: string
  ): Promise<string[]> {
    const watchlists = await this.getAllWatchlists(token);
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
