'use client';

import { Account } from '@/components/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { WatchlistItem } from '@/types';
import { Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Transaction {
  signature: string;
  from: string;
  to: string;
  action: string;
  timestamp: number;
}

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch('/api/watchlist');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setWatchlist(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to fetch watchlist');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWatchlist();
    const clientId = uuidv4();
    const ws = new WebSocket(
      `${window.location.origin}/api/webhook?clientId=${clientId}`
    );

    ws.onmessage = (event) => {
      const newTransaction = JSON.parse(event.data);
      setTransactions((prev) => [newTransaction, ...prev].slice(0, 10)); // Keep only the 10 most recent transactions
    };

    return () => {
      ws.close();
    };
  }, [fetchWatchlist]);

  const addToWatchlist = async () => {
    if (newAddress && newLabel) {
      try {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: newAddress, label: newLabel }),
        });
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.ok) {
          setNewAddress('');
          setNewLabel('');
          fetchWatchlist();
        } else {
          setError('Failed to add to watchlist');
        }
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        setError('Failed to add to watchlist');
      }
    }
  };

  const removeFromWatchlist = async (address: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        fetchWatchlist();
      } else {
        setError('Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      setError('Failed to remove from watchlist');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
          <Button size="icon" onClick={addToWatchlist} className={cn('w-32')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2 text-high-contrast-text">
        Your Watchlist
      </h2>
      {watchlist.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className={cn('border-b border-white/20')}>
              <TableHead className="text-high-contrast-text font-semibold">
                Label
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                Address
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlist.map((item) => (
              <TableRow
                key={item.address}
                className={cn(
                  'border-b border-white/20 hover:bg-white/10 transition-colors'
                )}
              >
                <TableCell className="text-high-contrast-text">
                  {item.label}
                </TableCell>
                <TableCell className="text-high-contrast-text">
                  <Account address={item.address} />
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    // variant="outline"
                    onClick={() => removeFromWatchlist(item.address)}
                    className={cn(
                      'bg-red-500 hover:bg-red-600 transition-colors text-high-contrast-text'
                    )}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="w-full text-center p-3">No account in watchlist</p>
      )}

      <h2 className="text-xl font-semibold my-4 text-high-contrast-text">
        Recent Transactions
      </h2>
      {transactions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className={cn('border-b border-white/20')}>
              <TableHead className="text-high-contrast-text font-semibold">
                Signature
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                From
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                To
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                Action
              </TableHead>
              <TableHead className="text-high-contrast-text font-semibold">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.signature}
                className={cn(
                  'border-b border-white/20 hover:bg-white/10 transition-colors'
                )}
              >
                <TableCell className="text-high-contrast-text">
                  {tx.signature.slice(0, 6)}...
                </TableCell>
                <TableCell className="text-high-contrast-text">
                  <Account address={tx.from} />
                </TableCell>
                <TableCell className="text-high-contrast-text">
                  <Account address={tx.to} />
                </TableCell>
                <TableCell className="text-high-contrast-text">
                  {tx.action}
                </TableCell>
                <TableCell className="text-high-contrast-text">
                  {new Date(tx.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="w-full text-center p-3">No transaction to be displayed</p>
      )}
    </div>
  );
}
