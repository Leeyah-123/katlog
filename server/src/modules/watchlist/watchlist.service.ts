import { config } from '../../config';
import { AccountAction, Watchlist } from '../../core/types';

export class WatchlistService {
  async getAllWatchlists(): Promise<Watchlist[]> {
    // Fetch all watchlists from main server
    const response = await fetch(`${config.mainServerUrl}/api/watchlists`);
    const watchlists = await response.json();
    return watchlists;
  }

  async getWatchlistByUserId(userId: string): Promise<Watchlist[]> {
    const watchlists = await this.getAllWatchlists();

    const userWatchlists = watchlists.filter(
      (watchlist) => watchlist.userId === userId
    );

    return userWatchlists;
  }

  async checkWatchedAddresses(
    transaction: AccountAction
  ): Promise<{ userId: string; account: string; accountLabel: string }[]> {
    let watchlists = await this.getAllWatchlists();

    const notifyUsers: {
      userId: string;
      account: string;
      accountLabel: string;
    }[] = [];

    for (const watchlist of watchlists) {
      const watchedAddresses = watchlist.items
        .filter((item) => item.emailNotifications)
        .map((item) => item.address);
      if (watchedAddresses.includes(transaction.from)) {
        notifyUsers.push({
          userId: watchlist.userId,
          account: transaction.from,
          accountLabel: watchlist.items.find(
            (item) => item.address === transaction.from
          )?.label!,
        });
      }

      if (watchedAddresses.includes(transaction.to)) {
        notifyUsers.push({
          userId: watchlist.userId,
          account: transaction.to,
          accountLabel: watchlist.items.find(
            (item) => item.address === transaction.to
          )?.label!,
        });
      }
    }

    return notifyUsers;
  }
}
