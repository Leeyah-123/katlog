import { Account } from '@/components/account';
import AccountActions from '@/components/core/account/account-actions';
import { truncateAddress } from '@/lib/utils';
import { Metadata } from 'next';

interface AccountPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const address = (await params).address;

  return {
    title: `Account ${truncateAddress(address)} | Katlog`,
    description: `View activities for Solana account ${truncateAddress(
      address
    )}`,
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const address = (await params).address;

  return (
    <div className="glassmorphism p-6">
      <h1 className="text-3xl font-bold mb-6 text-high-contrast-text">
        Account:{' '}
        <span className="text-foreground/80">
          <Account address={address} />
        </span>
      </h1>
      <AccountActions address={address} />
      {/* {actions.length > 0 ? (
        <AccountActions address={params.address} actions={actions} />
      ) : (
        <p className="text-high-contrast-text">
          No actions found for this account.
        </p>
      )} */}
    </div>
  );
}
