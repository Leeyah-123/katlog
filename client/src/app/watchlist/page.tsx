import WatchlistManager from '@/components/core/watchlist/watchlist-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as motion from 'motion/react-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist | Katlog',
  description: 'Manage your watchlist of Solana accounts',
};

export default async function WatchlistPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/10 border-0 backdrop-blur-lg text-white">
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <p className="text-sm text-gray-300">
              Add accounts to your watchlist to be notified when they&apos;re
              involved in a transaction.
            </p>
          </CardHeader>
          <CardContent>
            <WatchlistManager />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
