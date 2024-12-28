import { cn, truncateAddress } from '@/lib/utils';
import Link from 'next/link';
import { CopyButton } from './copy-button';

interface AccountProps {
  address: string;
  link?: boolean;
  copyable?: boolean;
  className?: string;
}

export function Account({
  address,
  link,
  copyable = true,
  className,
}: AccountProps) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-300">
      {link ? (
        <Link
          href={`/account/${address}`}
          className={cn('hover:opacity-80', className)}
        >
          {truncateAddress(address)}
        </Link>
      ) : (
        <span className={className}>{truncateAddress(address)}</span>
      )}
      {copyable && <CopyButton text={address} />}
    </div>
  );
}
