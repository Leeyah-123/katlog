'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';

interface AccountActionsProps {
  address: string;
}

export default function AccountActions({ address }: AccountActionsProps) {
  const { transactions } = useWebSocketConnection();
  const accountTransactions = transactions.get(address);

  return <TransactionsTable transactions={accountTransactions ?? []} />;
}
