'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const menuVariants = {
    closed: { opacity: 0, x: '100%' },
    open: { opacity: 1, x: 0 },
  };

  return (
    <header
      className={cn(
        'sticky z-40 max-w-7xl top-0 md:top-5 mx-auto px-4 py-6 glassmorphism'
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
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
                <WalletMultiButton />
              </>
            ) : (
              <WalletMultiButton />
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            {isAuthenticated ? (
              <>
                <button
                  className="z-50 text-white p-2"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle menu"
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={isOpen ? 'open' : 'closed'}
                  >
                    <motion.path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      variants={{
                        closed: { d: 'M4 6h16M4 12h16M4 18h16' },
                        open: { d: 'M6 18L18 6M6 6l12 12' },
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.svg>
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 left-0 top-0 w-full h-[100dvh]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsOpen(false)}
                    >
                      <motion.div
                        className="fixed right-0 top-0 h-max w-64 bg-gray-900 p-6 z-50"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-6 mt-12">
                          <Link
                            href="/watchlist"
                            className="text-white hover:text-gray-300"
                            onClick={() => setIsOpen(false)}
                          >
                            Watchlist
                          </Link>
                          <Link
                            href="/profile"
                            className="text-white hover:text-gray-300"
                            onClick={() => setIsOpen(false)}
                          >
                            Profile
                          </Link>
                          <div className="!w-full">
                            <WalletMultiButton />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
