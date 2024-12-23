import { truncateAddress } from '@/lib/utils';
import Link from 'next/link';
import { CopyButton } from './copy-button';

interface AccountProps {
  address: string;
  link?: boolean;
  copyable?: boolean;
}

export function Account({ address, link, copyable = true }: AccountProps) {
  return (
    <div className="inline-flex items-center gap-2">
      {link ? (
        <Link
          href={`/account/${address}`}
          className="text-[#FFD700] hover:opacity-80 transition-colors"
        >
          {truncateAddress(address)}
        </Link>
      ) : (
        <span className="text-[#FFD700] hover:opacity-80 transition-colors">
          {truncateAddress(address)}
        </span>
      )}
      {copyable && <CopyButton text={address} />}
    </div>
  );
}
