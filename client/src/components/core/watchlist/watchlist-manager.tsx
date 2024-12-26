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
import { useToast } from '@/hooks/use-toast';
import { cn, truncateAddress } from '@/lib/utils';
import { WatchlistItem } from '@/types';
import { Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loading } from 'notiflix';
import { useEffect, useState } from 'react';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();
  const toast = useToast();

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlists/user');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setWatchlist(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.toast({
        title: 'Failed to fetch watchlist',
        description: 'Unable to fetch watchlist. Please try again later.',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return Loading.hourglass();
    Loading.remove();
  }, [loading]);

  useEffect(() => {
    fetchWatchlist();
    const clientId = uuidv4();
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL}/api/webhook?clientId=${clientId}`
    );

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'transaction') {
        const newTransaction = message.data as Transaction;
        setTransactions((prev) => [newTransaction, ...prev].slice(0, 10)); // Keep only the 10 most recent transactions
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToWatchlist = async () => {
    if (newAddress && newLabel) {
      try {
        const response = await fetch('/api/watchlists', {
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
          toast.toast({
            title: 'Failed to add to watchlist',
            description:
              'Unable to add account to watchlist. Please try again later.',
          });
        }
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        toast.toast({
          title: 'Failed to add to watchlist',
          description:
            'Unable to add account to watchlist. Please try again later.',
        });
      }
    }
  };

  const removeFromWatchlist = async (address: string) => {
    try {
      const response = await fetch('/api/watchlists', {
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
        toast.toast({
          title: 'Failed to remove from watchlist',
          description:
            'Unable to remove account from watchlist. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.toast({
        title: 'Failed to remove from watchlist',
        description:
          'Unable to remove account from watchlist. Please try again later.',
      });
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
                  {truncateAddress(tx.signature)}
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
