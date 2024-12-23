import { getUserFromToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { UserMenu } from './user-menu';

export default async function Header() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  let email = null;

  if (token) {
    const user = await getUserFromToken(token);
    email = user ? user.email : null;
  }

  return (
    <header className={cn('py-4 px-4 glassmorphism')}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          <span className={cn('drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)]')}>
            Katlog
          </span>
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

          <UserMenu initialEmail={email} />
        </nav>
      </div>
    </header>
  );
}
