'use client';

import { WatchlistItem } from '@/types';
import { validateAddress, validateLabel } from '@/utils/validation';
import { Confirm, Notify } from 'notiflix';
import { useEffect, useState } from 'react';

interface UseWatchlistTableProps {
  watchlist: WatchlistItem[];
  onUpdate: (
    address: string,
    data: Partial<WatchlistItem>
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (address: string) => Promise<{ success: boolean; error?: string }>;
}

export const useWatchlistTable = ({
  watchlist,
  onUpdate,
  onRemove,
}: UseWatchlistTableProps) => {
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [editedAddress, setEditedAddress] = useState('');
  const [editedLabel, setEditedLabel] = useState('');
  const [editAddressError, setEditAddressError] = useState('');
  const [editLabelError, setEditLabelError] = useState('');
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
    setEditAddressError('');
    setEditLabelError('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditedAddress('');
    setEditedLabel('');
    setEditAddressError('');
    setEditLabelError('');
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Do nothing if no change was made
    if (
      editedAddress === editingItem.address &&
      editedLabel === editingItem.label
    ) {
      setEditingItem(null);
      return;
    }

    const { valid: isAddressValid, error: addressError } =
      validateAddress(editedAddress);
    const { valid: isLabelValid, error: labelError } =
      validateLabel(editedLabel);

    if (!isAddressValid) {
      setEditAddressError(addressError!);
      return;
    }
    if (!isLabelValid) {
      setEditLabelError(labelError!);
      return;
    }

    // Reset error fields
    setEditAddressError('');
    setEditLabelError('');

    Confirm.show(
      'Confirm Edit',
      'Are you sure you want to save these changes?',
      'Yes',
      'No',
      async () => {
        const success = await onUpdate(editingItem.address, {
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

      const success = await onUpdate(address, {
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

  const handleRemove = async (address: string) => {
    Confirm.show(
      'Remove from watchlist',
      'Are you sure you want to remove this address from watchlist?',
      'Yes',
      'No',
      async () => {
        const success = await onRemove(address);
        if (success) {
          Notify.success('Address removed from watchlist');
        }
      },
      () => {
        Notify.info('Action cancelled');
      }
    );
  };

  return {
    editingItem,
    editedAddress,
    editedLabel,
    editAddressError,
    editLabelError,
    notificationStates,
    setEditedAddress,
    setEditedLabel,
    handleEdit,
    handleCancelEdit,
    handleSave,
    handleNotificationToggle,
    handleRemove,
  };
};
