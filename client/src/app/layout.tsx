import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { WatchlistProvider } from '@/providers/watchlist-provider';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Katlog',
  description: 'Monitor account actions on Solana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          'bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 min-h-screen'
        )}
      >
        <AuthProvider>
          <WatchlistProvider>
            <Header />

            <div className="flex flex-col min-h-screen">
              <main className="flex-grow container mx-auto py-8">
                {children}
              </main>
              <footer className="py-4 text-center text-sm text-high-contrast-text/80">
                © 2024 Katlog. All rights reserved.
              </footer>
            </div>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
