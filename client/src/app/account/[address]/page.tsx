import { truncateAddress } from '@/lib/utils';
import { Metadata } from 'next';
import AccountPageClient from './page-client';

interface AccountPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const address = (await params).address;

  return {
    title: `Account Activities | Katlog`,
    description: `View activities for Solana account ${truncateAddress(
      address
    )}`,
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const address = (await params).address;

  return <AccountPageClient address={address} />;
}
