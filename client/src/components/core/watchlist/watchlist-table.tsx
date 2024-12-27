'use client';

import { Account } from '@/components/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/providers/watchlist-provider';
import { WatchlistItem } from '@/types';
import { validateAddress, validateLabel } from '@/utils/validation';
import { Edit2, Save, Trash } from 'lucide-react';
import { Confirm, Notify } from 'notiflix';
import { useEffect, useState } from 'react';

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
}

export default function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [editedAddress, setEditedAddress] = useState('');
  const [editedLabel, setEditedLabel] = useState('');
  const [editAddressError, setEditAddressError] = useState('');
  const [editLabelError, setEditLabelError] = useState('');
  const { updateWatchlistItem, removeFromWatchlist } = useWatchlist();
  const [notificationStates, setNotificationStates] = useState<
    Record<string, boolean>
  >({});

  // Initialize notification states from watchlist
  useEffect(() => {
    const states = watchlist.reduce(
      (acc, item) => ({
        ...acc,
        [item.address]: item.emailNotifications,
      }),
      {}
    );
    setNotificationStates(states);
  }, [watchlist]);

  const handleEdit = (item: WatchlistItem) => {
    setEditingItem(item);
    setEditedAddress(item.address);
    setEditedLabel(item.label);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Reset error fields
    setEditAddressError('');
    setEditLabelError('');

    const { valid: isAddressValid, error: addressError } =
      validateAddress(editedAddress);
    if (!isAddressValid) {
      setEditAddressError(addressError!);
    }
    const { valid: isLabelValid, error: labelError } =
      validateLabel(editedLabel);
    if (!isLabelValid) {
      setEditLabelError(labelError!);
    }
    if (!isAddressValid || !isLabelValid) return;

    Confirm.show(
      'Confirm Edit',
      'Are you sure you want to save these changes?',
      'Yes',
      'No',
      async () => {
        const success = await updateWatchlistItem(editingItem.address, {
          address: editedAddress,
          label: editedLabel,
        });

        if (success) {
          Notify.success('Watchlist item updated successfully');
          setEditingItem(null);
        }
      },
      () => {
        setEditingItem(null);
        Notify.info('Edit cancelled');
      }
    );
  };

  const handleNotificationToggle = async (
    address: string,
    enabled: boolean
  ) => {
    // Store the previous state in case of failure
    const previousState = notificationStates[address];

    try {
      // Optimistically update the UI
      setNotificationStates((prev) => ({
        ...prev,
        [address]: enabled,
      }));

      const success = await updateWatchlistItem(address, {
        emailNotifications: enabled,
      });

      if (success) {
        Notify.success(
          `Email notifications ${enabled ? 'enabled' : 'disabled'}`
        );
      } else {
        // Revert on failure
        setNotificationStates((prev) => ({
          ...prev,
          [address]: previousState,
        }));
        Notify.failure('Failed to update notifications settings');
      }
    } catch {
      // Revert on error
      setNotificationStates((prev) => ({
        ...prev,
        [address]: previousState,
      }));
      Notify.failure('Failed to update notifications settings');
    }
  };

  const handleRemoveFromWatchlist = async (address: string) => {
    Confirm.show(
      'Remove from watchlist',
      'Are you sure you want to remove this address from watchlist?',
      'Yes',
      'No',
      async () => {
        const success = await removeFromWatchlist(address);
        if (success) {
          Notify.success('Address removed from watchlist');
        }
      },
      () => {
        Notify.info('Action cancelled');
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
            Notifications
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
              <div>
                {editingItem?.address === item.address ? (
                  <>
                    <Input
                      className={cn(
                        'glassmorphism',
                        editLabelError && '!border-destructive'
                      )}
                      value={editedLabel}
                      onChange={(e) => setEditedLabel(e.target.value)}
                    />
                    {editLabelError && (
                      <p className="text-destructive text-xs mt-1">
                        {editLabelError}
                      </p>
                    )}
                  </>
                ) : (
                  item.label
                )}
              </div>
            </TableCell>
            <TableCell className="text-high-contrast-text">
              <div>
                {editingItem?.address === item.address ? (
                  <>
                    <Input
                      className={cn(
                        'glassmorphism',
                        editAddressError && '!border-destructive'
                      )}
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                    />
                    {editAddressError && (
                      <p className="text-destructive text-xs mt-1">
                        {editAddressError}
                      </p>
                    )}
                  </>
                ) : (
                  <Account address={item.address} link />
                )}
              </div>
            </TableCell>
            <TableCell>
              <Switch
                checked={notificationStates[item.address] ?? false}
                onCheckedChange={(enabled: boolean) =>
                  handleNotificationToggle(item.address, enabled)
                }
              />
            </TableCell>
            <TableCell className="flex gap-2">
              {editingItem?.address === item.address ? (
                <Button
                  size="icon"
                  onClick={handleSave}
                  className={cn(
                    'bg-green-500 hover:bg-green-600 transition-colors text-high-contrast-text'
                  )}
                >
                  <Save className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => handleEdit(item)}
                  className={cn(
                    'bg-blue-500 hover:bg-blue-600 transition-colors text-high-contrast-text'
                  )}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                onClick={() => handleRemoveFromWatchlist(item.address)}
                className={cn(
                  'bg-red-500 hover:bg-red-600 transition-colors text-high-contrast-text'
                )}
              >
                {' '}
                <Trash className="h-4 w-4" />{' '}
              </Button>{' '}
            </TableCell>{' '}
          </TableRow>
        ))}{' '}
      </TableBody>{' '}
    </Table>
  ) : (
    <p className="w-full text-center p-3">No account in watchlist</p>
  );
}
