'use client';

import { useAuth } from '@/providers/auth-provider';
import { Account } from '@/components/account';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './profile-form';

export function ProfileDetails() {
  const { walletAddress, email } = useAuth();

  if (!walletAddress) {
    return (
      <div className="text-center py-6">
        Please connect your wallet to view profile details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Connected Wallet</h3>
        <p className="text-sm text-gray-400 mb-2">
          Your currently connected Solana wallet address
        </p>
        <Account address={walletAddress} className="text-lg" />
      </div>

      <Separator className="bg-white/10" />

      <div>
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-gray-400 mb-4">
          {email
            ? 'Update your email address for notifications'
            : 'Add an email address to enable notifications'}
        </p>
        <ProfileForm initialEmail={email} />
      </div>
    </div>
  );
}
