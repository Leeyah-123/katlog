'use client';

import AccountActions from '@/components/core/account/account-actions';
import AccountDetails from '@/components/core/account/account-details';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useWatchlist } from '@/providers/watchlist-provider';
import { ArrowLeft, Clock } from 'lucide-react';
import * as motion from 'motion/react-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type AccountPageClientProps = {
  address: string;
};

export default function AccountPageClient({ address }: AccountPageClientProps) {
  const { userId, isAuthenticated } = useAuth();
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkAddress } = useWatchlist();

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    if (!(await checkAddress(address))) {
      console.log('WEE');
      setInvalidAddress(true);
    }
  }, [address, checkAddress, isAuthenticated, userId]);

  useEffect(() => {
    setLoading(true);
    checkAuth().finally(() => setLoading(false));
  }, [checkAuth]);

  if (isAuthenticated && !loading && invalidAddress) return notFound();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 border-0 backdrop-blur-lg text-white">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Connect your wallet to view this page.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <Link
            href="/watchlist"
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-white hover:bg-white/10',
            })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Watchlist
          </Link>
        </div>

        <Card className="bg-white/10 border-0 backdrop-blur-lg text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                Account Details
              </CardTitle>
              <div className="text-sm text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: Just now
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <AccountDetails address={address} />
              <AccountActions address={address} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
