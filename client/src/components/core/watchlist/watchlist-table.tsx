'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WatchlistItem } from '@/types';
import { useWatchlistTable } from './hooks/use-watchlist-table';
import { WatchlistTableRow } from './watchlist-table-row';

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  onUpdate: (address: string, data: Partial<WatchlistItem>) => Promise<boolean>;
  onRemove: (address: string) => Promise<boolean>;
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
    handleSave,
    handleNotificationToggle,
    handleRemove,
  } = useWatchlistTable({ watchlist, onUpdate, onRemove });

  return watchlist.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/20">
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
          <WatchlistTableRow
            key={item.address}
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
            onSave={() => handleSave()}
            onDelete={() => handleRemove(item.address)}
            onNotificationToggle={(enabled) =>
              handleNotificationToggle(item.address, enabled)
            }
            onEditAddressChange={setEditedAddress}
            onEditLabelChange={setEditedLabel}
          />
        ))}
      </TableBody>
    </Table>
  ) : (
    <p className="w-full text-center p-3">No account in watchlist</p>
  );
};
