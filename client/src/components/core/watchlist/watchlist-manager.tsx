'use client';

import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { useWatchlist } from '@/providers/watchlist-provider';
import { Loading } from 'notiflix';
import { useEffect, useRef } from 'react';
import { AddWatchlistForm } from './add-watchlist-form';
import { WatchlistTable } from './watchlist-table';
import TransactionsTable from '@/components/shared/transactions-table';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevTransactionCountRef = useRef(0);

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  useEffect(() => {
    if (latestTransactions.length > prevTransactionCountRef.current) {
      audioRef.current?.play();
    }
    prevTransactionCountRef.current = latestTransactions.length;
  }, [latestTransactions]);

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/notification.mp3" className="hidden" />
      <AddWatchlistForm onSubmit={addToWatchlist} />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Watchlist</h3>
        <div className="space-y-4">
          <WatchlistTable
            watchlist={watchlist ?? []}
            onUpdate={updateWatchlistItem}
            onRemove={removeFromWatchlist}
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <TransactionsTable transactions={latestTransactions} />
      </div>
    </div>
  );
}
