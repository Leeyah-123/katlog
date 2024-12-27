'use client';

import { useEffect } from 'react';
import { Loading } from 'notiflix';
import TransactionsTable from '@/components/shared/transactions-table';
import { useWatchlist } from '@/providers/watchlist-provider';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { AddWatchlistForm } from './add-watchlist-form';
import { WatchlistTable } from './watchlist-table';

export default function WatchlistManager() {
  const {
    watchlist,
    loading,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    fetchWatchlist,
  } = useWatchlist();
  const { latestTransactions } = useWebSocketConnection();

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
          Add to Watchlist
        </h2>
        <AddWatchlistForm onSubmit={addToWatchlist} />
      </div>

      <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
        Your Watchlist
      </h2>
      <WatchlistTable
        watchlist={watchlist ?? []}
        onUpdate={updateWatchlistItem}
        onRemove={removeFromWatchlist}
      />

      <h2 className="text-xl font-semibold my-4 text-high-contrast-text">
        Recent Transactions
      </h2>
      <TransactionsTable transactions={latestTransactions} />
    </div>
  );
}
