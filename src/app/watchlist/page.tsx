import WatchlistManager from '@/components/core/watchlist/watchlist-manager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist | Katlog',
  description: 'Manage your watchlist of Solana accounts',
};

export default async function WatchlistPage() {
  return (
    <div className="glassmorphism p-6">
      <h1 className="text-3xl font-bold mb-1 text-white">
        <span>Watchlist</span>
      </h1>
      <h2 className="text-sm font-semibold mb-6 text-slate-200">
        Add accounts to your watchlist to be notified when they&apos;re involved
        in a transaction.
      </h2>
      <WatchlistManager />
    </div>
  );
}
