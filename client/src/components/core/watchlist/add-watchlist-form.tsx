'use client';

import { useWatchlistForm } from '@/components/core/watchlist/hooks/use-watchlist-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddWatchlistFormProps {
  onSubmit: (
    address: string,
    label: string,
    emailNotifications: boolean
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AddWatchlistForm = ({ onSubmit }: AddWatchlistFormProps) => {
  const {
    address,
    setAddress,
    label,
    setLabel,
    emailNotifications,
    setEmailNotifications,
    addressError,
    labelError,
    handleSubmit,
  } = useWatchlistForm({ onSubmit });

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={cn(
              'bg-white/5 border-white/10 text-white placeholder:text-gray-400 flex-1',
              addressError && '!border-destructive'
            )}
          />
          {addressError && (
            <p className="text-destructive text-xs mt-1">{addressError}</p>
          )}
        </div>

        <div className="flex-1">
          <Input
            type="text"
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={cn(
              'bg-white/5 border-white/10 text-white placeholder:text-gray-400 flex-1',
              labelError && '!border-destructive'
            )}
          />
          {labelError && (
            <p className="text-destructive text-xs mt-1">{labelError}</p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-foreground"
        >
          Add
        </Button>
      </div>

      <div className="flex items-center space-x-2 mt-2 text-sm">
        <Checkbox
          id="emailNotifications"
          className="border-white/30"
          checked={emailNotifications}
          onCheckedChange={(checked) =>
            setEmailNotifications(checked as boolean)
          }
        />
        <label htmlFor="notifications" className="text-gray-300">
          Enable email notifications for new addresses by default
        </label>
      </div>
    </form>
  );
};
