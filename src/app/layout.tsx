import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
// import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Solana DApp Explorer',
  description: 'Explore Solana account activities and manage your watchlist',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'gradient-bg min-h-screen')}>
        {/* <ThemeProvider attribute="class" defaultTheme="dark" enableSystem> */}
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-4 text-center text-sm text-high-contrast-text/80">
            © 2023 Solana DApp Explorer. All rights reserved.
          </footer>
        </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
