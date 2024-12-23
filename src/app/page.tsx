import WatchlistManager from '@/components/core/watchlist/watchlist-manager';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Solana DApp Explorer',
  description: 'Manage your Solana account watchlist',
};

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1
        className={cn(
          'text-4xl font-bold mb-8 text-center text-high-contrast-text'
        )}
      >
        Solana Account Watchlist
      </h1>
      <WatchlistManager />
    </div>
  );
}
