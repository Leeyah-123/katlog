'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { UserMenu } from './user-menu';

export default function Header() {
  const { email } = useAuth();

  return (
    <header className={cn('py-4 px-4 glassmorphism')}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Katlog
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link
            href="/"
            className={cn(
              'text-sm font-medium text-white hover:text-solana-green transition-colors'
            )}
          >
            Home
          </Link>
          <Link
            href="/watchlist"
            className={cn(
              'text-sm font-medium text-white hover:text-solana-purple transition-colors'
            )}
          >
            Watchlist
          </Link>

          <UserMenu email={email} />
        </nav>
      </div>
    </header>
  );
}
