import { truncateAddress } from '@/lib/utils';
import Link from 'next/link';
import { CopyButton } from './copy-button';

interface SignatureProps {
  signature: string;
  link?: boolean;
  copyable?: boolean;
}

export function Signature({
  signature,
  link,
  copyable = true,
}: SignatureProps) {
  return (
    <div className="inline-flex items-center gap-2">
      {link ? (
        <Link
          href={`https://solcan.io/tx/${signature}?cluster=devnet`}
          className="text-[#FFD700] hover:opacity-80 transition-colors"
          title="View on Solcan"
          target="_blank"
        >
          {truncateAddress(signature)}
        </Link>
      ) : (
        <span className="text-[#FFD700] hover:opacity-80 transition-colors">
          {truncateAddress(signature)}
        </span>
      )}
      {copyable && <CopyButton text={signature} />}
    </div>
  );
}
