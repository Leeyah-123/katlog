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
      const watchedItems = watchlist.items.filter(
        (item) => item.emailNotifications
      );

      [transaction.from, transaction.to].forEach((address) => {
        const watchedItem = watchedItems.find(
          (item) =>
            item.address === address &&
            item.watchedNetworks.includes(transaction.network)
        );

        if (watchedItem) {
          notifyUsers.push({
            userId: watchlist.userId,
            account: address,
            accountLabel: watchedItem.label!,
          });
        }
      });
    }

    return notifyUsers;
  }
}
