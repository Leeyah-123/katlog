'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { motion } from 'motion/react';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { UserMenu } from './user-menu';

export default function Header() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const { email } = useAuth();

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

          <div className="flex items-center space-x-2">
            <Link
              href="/watchlist"
              className={buttonVariants({
                variant: 'ghost',
                className: 'text-white hover:text-purple-200',
              })}
            >
              Watchlist
            </Link>

            <UserMenu email={email} />
          </div>
        </div>
      </nav>
    </header>
  );
}
