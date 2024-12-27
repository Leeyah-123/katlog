'use client';

import { Account } from '@/components/account';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/providers/watchlist-provider';
import { WatchlistItem } from '@/types';
import { Trash } from 'lucide-react';
import { Confirm } from 'notiflix';

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
}

export default function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const toast = useToast();
  const { removeFromWatchlist } = useWatchlist();

  const handleRemoveFromWatchlist = async (address: string) => {
    Confirm.show(
      'Remove from watchlist',
      'Are you sure you want to remove this address from watchlist?',
      'Yes',
      'No',
      async () => {
        const success = await removeFromWatchlist(address);
        if (success) {
          toast.toast({
            title: 'Removed from watchlist',
            description: 'Address has been removed from watchlist',
            variant: 'success',
          });
        }
      },
      () => {
        toast.toast({
          title: 'Action cancelled',
        });
      }
    );
  };

  return watchlist.length > 0 ? (
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
              <Account address={item.address} link />
            </TableCell>
            <TableCell>
              <Button
                size="icon"
                onClick={() => handleRemoveFromWatchlist(item.address)}
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
  );
}
