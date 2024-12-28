'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { useEffect, useRef } from 'react';

interface AccountActionsProps {
  address: string;
}

export default function AccountActions({ address }: AccountActionsProps) {
  const { transactions } = useWebSocketConnection();
  const accountTransactions = transactions.get(address);

  const audioRef = useRef<HTMLAudioElement>(null);
  const prevTransactionCountRef = useRef(0);

  useEffect(() => {
    if (!accountTransactions) return;

    if (accountTransactions.length > prevTransactionCountRef.current) {
      audioRef.current?.play();
    }

    prevTransactionCountRef.current = accountTransactions.length;
  }, [accountTransactions, address]);

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" className="hidden" />
      <TransactionsTable transactions={accountTransactions ?? []} />
    </>
  );
}
