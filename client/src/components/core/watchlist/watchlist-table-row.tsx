'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Account } from '@/components/account';
import { Edit2, Save, Trash } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { WatchlistItem } from '@/types';
import { cn } from '@/lib/utils';

interface WatchlistTableRowProps {
  item: WatchlistItem;
  isEditing: boolean;
  editedData?: {
    address: string;
    label: string;
    addressError?: string;
    labelError?: string;
  };
  notificationEnabled: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onNotificationToggle: (enabled: boolean) => void;
  onEditAddressChange: (address: string) => void;
  onEditLabelChange: (label: string) => void;
}

export const WatchlistTableRow = ({
  item,
  isEditing,
  editedData,
  notificationEnabled,
  onEdit,
  onSave,
  onDelete,
  onNotificationToggle,
  onEditAddressChange,
  onEditLabelChange,
}: WatchlistTableRowProps) => {
  return (
    <TableRow className="border-b border-white/20 hover:bg-white/10 transition-colors">
      <TableCell className="text-high-contrast-text">
        <div>
          {isEditing ? (
            <>
              <Input
                className={cn(
                  'glassmorphism',
                  editedData?.labelError && '!border-destructive'
                )}
                value={editedData?.label}
                onChange={(e) => onEditLabelChange(e.target.value)}
              />
              {editedData?.labelError && (
                <p className="text-destructive text-xs mt-1">
                  {editedData.labelError}
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
          {isEditing ? (
            <>
              <Input
                className={cn(
                  'glassmorphism',
                  editedData?.addressError && '!border-destructive'
                )}
                value={editedData?.address}
                onChange={(e) => onEditAddressChange(e.target.value)}
              />
              {editedData?.addressError && (
                <p className="text-destructive text-xs mt-1">
                  {editedData.addressError}
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
          checked={notificationEnabled}
          onCheckedChange={onNotificationToggle}
        />
      </TableCell>
      <TableCell className="flex gap-2">
        {isEditing ? (
          <Button
            size="icon"
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 transition-colors text-high-contrast-text"
          >
            <Save className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-600 transition-colors text-high-contrast-text"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 transition-colors text-high-contrast-text"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
