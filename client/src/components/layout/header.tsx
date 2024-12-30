'use client';

import { cn } from '@/lib/utils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

export default function Header() {
  const { isAuthenticated } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <header
      className={cn(
        'sticky z-50 max-w-7xl top-0 md:top-5 mx-auto px-4 py-6 glassmorphism'
      )}
    >
      <nav>
        <div className="flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200"
            {...fadeIn}
          >
            <Link href="/" aria-label="Go back to home">
              Katlog
            </Link>
          </motion.h1>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link
                  href="/watchlist"
                  className="text-white hover:text-gray-300"
                >
                  Watchlist
                </Link>
                <Link
                  href="/profile"
                  className="text-white hover:text-gray-300"
                >
                  Profile
                </Link>
              </>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
