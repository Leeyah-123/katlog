'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/providers/watchlist-provider';
import { Plus } from 'lucide-react';
import { Loading } from 'notiflix';
import { useEffect, useState } from 'react';
import WatchlistTable from './watchlist-table';

export default function WatchlistManager() {
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const toast = useToast();

  const { watchlist, loading, addToWatchlist, fetchWatchlist } = useWatchlist();

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);
  const { latestTransactions } = useWebSocketConnection();

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  const handleAddToWatchlist = async () => {
    if (newAddress && newLabel) {
      const success = await addToWatchlist(newAddress, newLabel);
      if (success) {
        setNewAddress('');
        setNewLabel('');
        toast.toast({
          title: 'Added to watchlist',
          description: 'Address has been added to watchlist',
          variant: 'success',
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
          Add to Watchlist
        </h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Account Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className={cn(
              'glassmorphism text-white !placeholder-white/70 border-white/20'
            )}
          />
          <Input
            type="text"
            placeholder="Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className={cn(
              'glassmorphism text-white !placeholder-white/70 border-white/20'
            )}
          />
          <Button
            size="icon"
            onClick={handleAddToWatchlist}
            className={cn('w-32')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
        Your Watchlist
      </h2>
      <WatchlistTable watchlist={watchlist ?? []} />

      <h2 className="text-xl font-semibold my-4 text-high-contrast-text">
        Recent Transactions
      </h2>
      <TransactionsTable transactions={latestTransactions} />
    </div>
  );
}
