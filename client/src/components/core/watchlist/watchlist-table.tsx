'use client';

import { WatchlistItem } from '@/types';
import { useWatchlistTable } from './hooks/use-watchlist-table';
import { WatchlistTableRow } from './watchlist-table-row';

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  onUpdate: (
    address: string,
    data: Partial<WatchlistItem>
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (address: string) => Promise<{ success: boolean; error?: string }>;
}

export const WatchlistTable = ({
  watchlist,
  onUpdate,
  onRemove,
}: WatchlistTableProps) => {
  const {
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
  } = useWatchlistTable({ watchlist, onUpdate, onRemove });

  return watchlist.length > 0 ? (
    watchlist.map((item, index) => (
      <WatchlistTableRow
        key={item.address}
        index={index}
        item={item}
        isEditing={editingItem?.address === item.address}
        editedData={
          editingItem?.address === item.address
            ? {
                address: editedAddress,
                label: editedLabel,
                addressError: editAddressError,
                labelError: editLabelError,
              }
            : undefined
        }
        notificationEnabled={notificationStates[item.address] ?? false}
        onEdit={() => handleEdit(item)}
        onCancelEdit={() => handleCancelEdit()}
        onSave={() => handleSave()}
        onDelete={() => handleRemove(item.address)}
        onNotificationToggle={(enabled) =>
          handleNotificationToggle(item.address, enabled)
        }
        onEditAddressChange={setEditedAddress}
        onEditLabelChange={setEditedLabel}
      />
    ))
  ) : (
    <p className="w-full text-center p-3">No account in watchlist</p>
  );
};
