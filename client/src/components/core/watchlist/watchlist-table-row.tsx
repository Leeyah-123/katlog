'use client';

import { Account } from '@/components/account';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Network, NETWORKS, WatchlistItem } from '@/types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Pen, Save, Trash, X } from 'lucide-react';
import * as motion from 'motion/react-client';

interface WatchlistTableRowProps {
  index: number;
  item: WatchlistItem;
  isEditing: boolean;
  editedData?: {
    address: string;
    label: string;
    watchedNetworks: Network[];
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
  onEditWatchedNetworksChange: (networks: Network[]) => void;
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
  onEditWatchedNetworksChange,
}: WatchlistTableRowProps) => {
  const isWatched = item.watchedNetworks?.length > 0;

  return (
    <motion.div
      key={item.address}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'bg-white/5 rounded-lg p-4 flex max-md:flex-col max-sm:gap-5 items-center justify-between group hover:bg-white/10 transition-all'
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
              {!isWatched && !isEditing && (
                <Badge variant="secondary" className="ml-2">
                  Not watched
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          {!isWatched && (
            <TooltipContent>
              <p>This address is not being watched on any network</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <div className="max-md:border max-md:border-white max-md:p-2 max-md:rounded-md space-y-4">
        <div className="flex flex-col gap-3">
          {/* Networks Section */}
          {isEditing ? (
            <div className="grid grid-cols-3 gap-3">
              {NETWORKS.map((network) => (
                <div
                  key={network}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded border transition-colors'
                  )}
                >
                  <Checkbox
                    id={`network-${network}-${item.address}`}
                    className="border-white/30"
                    checked={editedData?.watchedNetworks.includes(network)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onEditWatchedNetworksChange([
                          ...(editedData?.watchedNetworks || []),
                          network,
                        ]);
                      } else {
                        onEditWatchedNetworksChange(
                          editedData?.watchedNetworks.filter(
                            (n) => n !== network
                          ) || []
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`network-${network}-${item.address}`}
                    className="text-sm text-gray-300 cursor-pointer select-none"
                  >
                    {network}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            item.watchedNetworks?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.watchedNetworks.map((network) => (
                  <Badge key={network} variant="default">
                    {network}
                  </Badge>
                ))}
              </div>
            )
          )}

          {/* Actions Section */}
          <div className="flex items-center justify-end gap-4 pt-2">
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
      </div>
    </motion.div>
  );
};
