'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlistForm } from '@/components/core/watchlist/hooks/use-watchlist-form';

interface AddWatchlistFormProps {
  onSubmit: (
    address: string,
    label: string,
    emailNotifications: boolean
  ) => Promise<boolean>;
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
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Account Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={cn(
              'glassmorphism text-white !placeholder-white/70 border-white/20',
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
              'glassmorphism text-white !placeholder-white/70 border-white/20',
              labelError && '!border-destructive'
            )}
          />
          {labelError && (
            <p className="text-destructive text-xs mt-1">{labelError}</p>
          )}
        </div>
        <Button size="icon" type="submit" className="w-32">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          id="emailNotifications"
          checked={emailNotifications}
          onCheckedChange={(checked) =>
            setEmailNotifications(checked as boolean)
          }
        />
        <label htmlFor="emailNotifications" className="text-sm text-white">
          Email notifications
        </label>
      </div>
    </form>
  );
};
