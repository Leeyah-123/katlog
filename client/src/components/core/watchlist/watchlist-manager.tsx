'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import {
  useWebSocketConnection,
  WatchlistAccountTransaction,
} from '@/hooks/use-websocket-connection';
import { useWatchlist } from '@/providers/watchlist-provider';
import { Loading } from 'notiflix';
import { useEffect, useMemo, useRef } from 'react';
import { AddWatchlistForm } from './add-watchlist-form';
import { WatchlistTable } from './watchlist-table';

const getRecentTransactions = (
  transactions: Map<string, WatchlistAccountTransaction[]>
) => {
  const seen = new Set<{ signature: string; concernedAddress: string }>();

  return Array.from(transactions.values())
    .flat()
    .filter((tx) => {
      if (
        seen.has({
          signature: tx.action.signature,
          concernedAddress: tx.concernedAddress,
        })
      )
        return false;
      seen.add({
        signature: tx.action.signature,
        concernedAddress: tx.concernedAddress,
      });
      return true;
    })
    .sort(
      (a, b) => Date.parse(b.action.timestamp) - Date.parse(a.action.timestamp)
    )
    .slice(0, 50);
};

export default function WatchlistManager() {
  const {
    watchlist,
    loading,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    fetchWatchlist,
  } = useWatchlist();
  const { transactions } = useWebSocketConnection();
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevTransactionCountRef = useRef(0);
  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions),
    [transactions]
  );

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  useEffect(() => {
    const totalTransactions = Array.from(transactions.values()).flat().length;
    if (totalTransactions > prevTransactionCountRef.current) {
      audioRef.current?.play();
    }
    prevTransactionCountRef.current = totalTransactions;
  }, [transactions]);

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
        <TransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
}
