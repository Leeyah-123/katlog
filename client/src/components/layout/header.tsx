'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { motion } from 'motion/react';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { UserMenu } from './user-menu';
import { Menu, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { email } = useAuth();
  const isMobile = useMobile();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const menuAnimation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 },
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

          {!email && isMobile && (
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {email && (
            <div className="items-center space-x-2">
              <Link
                href="/watchlist"
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'text-white hover:text-purple-200',
                })}
              >
                Watchlist
              </Link>

              <UserMenu email={email} isMobile={isMobile} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {!email && isOpen && (
            <motion.div
              {...menuAnimation}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 flex flex-col space-y-4">
                <UserMenu email={email} isMobile={isMobile} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
