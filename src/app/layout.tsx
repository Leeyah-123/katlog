import Header from '@/components/layout/header';
import { ToastProvider } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
// import { ThemeProvider } from '@/providers/theme-provider';
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
      <body className={cn(inter.className, 'gradient-bg min-h-screen')}>
        <ToastProvider>
          {/* <ThemeProvider attribute="class" defaultTheme="dark" enableSystem> */}
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="py-4 text-center text-sm text-high-contrast-text/80">
              © 2024 Katlog. All rights reserved.
            </footer>
          </div>
          {/* </ThemeProvider> */}
        </ToastProvider>
      </body>
    </html>
  );
}
