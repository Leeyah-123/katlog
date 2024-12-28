'use client';

import { Account } from '@/components/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { WatchlistItem } from '@/types';
import { Pen, Save, Trash, X } from 'lucide-react';
import * as motion from 'motion/react-client';

interface WatchlistTableRowProps {
  index: number;
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
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onNotificationToggle: (enabled: boolean) => void;
  onEditAddressChange: (address: string) => void;
  onEditLabelChange: (label: string) => void;
}

export const WatchlistTableRow = ({
  index,
  item,
  isEditing,
  editedData,
  notificationEnabled,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onNotificationToggle,
  onEditAddressChange,
  onEditLabelChange,
}: WatchlistTableRowProps) => {
  return (
    <motion.div
      key={item.address}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 rounded-lg p-4 flex max-md:flex-col max-sm:gap-5 items-center justify-between group hover:bg-white/10 transition-all"
    >
      <div className="flex max-md:text-center items-center gap-4 flex-1">
        <div>
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
              <h4 className="font-medium">{item.label}</h4>
            )}
          </div>
          {isEditing ? (
            <>
              <Input
                className={cn(
                  'glassmorphism mt-2',
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
      </div>

      <div className="max-md:border max-md:border-white max-md:p-2 max-md:rounded-md">
        <h4 className="text-sm text-center font-semibold mb-2 md:hidden">
          Actions
        </h4>

        <div className="flex items-center gap-4">
          <Switch
            title={
              notificationEnabled
                ? 'Disable email notifications for this account'
                : 'Enable email notifications for this account'
            }
            checked={notificationEnabled}
            onCheckedChange={onNotificationToggle}
            className="data-[state=checked]:bg-success"
          />

          <div className="flex gap-2">
            {isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                title="Save changes"
                onClick={onSave}
                className="bg-green-500 hover:bg-green-600 transition-colors text-high-contrast-text"
              >
                <Save className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                title="Edit"
                onClick={onEdit}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Pen className="h-4 w-4" />
              </Button>
            )}
            {isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                title="Cancel changes"
                onClick={onCancelEdit}
                className="bg-orange-500 hover:bg-orange-600 transition-colors text-high-contrast-text"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                title="Delete"
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-600 transition-colors text-high-contrast-text"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
