import WatchlistManager from '@/components/core/watchlist/watchlist-manager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist | Solana DApp Explorer',
  description: 'Manage your watchlist of Solana accounts',
};

export default async function WatchlistPage() {
  return (
    <div className="glassmorphism p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">
        <span>Watchlist</span>
      </h1>
      <WatchlistManager />
    </div>
  );
}
