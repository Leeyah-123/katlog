import AccountActions from '@/components/core/account/account-actions';
import AccountDetails from '@/components/core/account/account-details';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/lib/utils';
import { ArrowLeft, Clock } from 'lucide-react';
import * as motion from 'motion/react-client';
import { Metadata } from 'next';
import Link from 'next/link';

interface AccountPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const address = (await params).address;

  return {
    title: `Account Activities | Katlog`,
    description: `View activities for Solana account ${truncateAddress(
      address
    )}`,
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const address = (await params).address;

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
