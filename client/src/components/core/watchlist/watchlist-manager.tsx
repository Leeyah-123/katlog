'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/providers/watchlist-provider';
import { validateAddress, validateLabel } from '@/utils/validation';
import { Plus } from 'lucide-react';
import { Loading, Notify } from 'notiflix';
import { FormEvent, useEffect, useState } from 'react';
import WatchlistTable from './watchlist-table';

export default function WatchlistManager() {
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [labelError, setLabelError] = useState('');

  const { watchlist, loading, addToWatchlist, fetchWatchlist } = useWatchlist();

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);
  const { latestTransactions } = useWebSocketConnection();

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  const handleAddToWatchlist = async (e: FormEvent) => {
    e.preventDefault();

    // Reset error fields
    setAddressError('');
    setLabelError('');

    const { valid: isAddressValid, error: addressError } =
      validateAddress(newAddress);
    if (!isAddressValid) {
      setAddressError(addressError!);
    }
    const { valid: isLabelValid, error: labelError } = validateLabel(newLabel);
    if (!isLabelValid) {
      setLabelError(labelError!);
    }
    if (!isAddressValid || !isLabelValid) return;

    if (isAddressValid && isLabelValid) {
      const success = await addToWatchlist(
        newAddress,
        newLabel,
        emailNotifications
      );
      if (success) {
        setNewAddress('');
        setNewLabel('');
        setEmailNotifications(false);
        Notify.success('Address has been added to watchlist');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
          Add to Watchlist
        </h2>
        <form onSubmit={handleAddToWatchlist}>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Account Address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className={cn(
                  'glassmorphism text-white !placeholder-white/70 border-white/20',
                  addressError && '!border-destructive'
                )}
              />
              {addressError && (
                <p className="text-destructive text-xs mt-1">{addressError}</p>
              )}
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className={cn(
                  'glassmorphism text-white !placeholder-white/70 border-white/20',
                  labelError && '!border-destructive'
                )}
              />
              {labelError && (
                <p className="text-destructive text-xs mt-1">{labelError}</p>
              )}
            </div>
            <Button size="icon" type="submit" className={cn('w-32')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                setEmailNotifications(checked as boolean)
              }
            />
            <label htmlFor="emailNotifications" className="text-sm text-white">
              Email notifications
            </label>
          </div>
        </form>
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
