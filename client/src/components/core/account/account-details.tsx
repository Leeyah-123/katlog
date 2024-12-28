'use client';

import { Account } from '@/components/account';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { getSolanaAccountBalance } from '@/lib/solana';
import { useEffect, useRef, useState } from 'react';

interface AccountDetailsProps {
  address: string;
}

export default function AccountDetails({ address }: AccountDetailsProps) {
  const [balance, setBalance] = useState(0);
  const { transactions } = useWebSocketConnection();
  const accountTransactions = transactions.get(address);
  const prevTransactionCountRef = useRef(0);

  // Update balance when there are new transactions
  useEffect(() => {
    if (!accountTransactions) return;

    if (accountTransactions.length > prevTransactionCountRef.current) {
      getSolanaAccountBalance(address).then(setBalance);
    }

    prevTransactionCountRef.current = accountTransactions.length;
  }, [accountTransactions, address]);

  useEffect(() => {
    getSolanaAccountBalance(address).then(setBalance);
  }, [address]);

  return (
    <div className="bg-white/5 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-gray-300 block">Address</label>
          <Account className="text-lg font-semibold" address={address} />
        </div>
        <div className="text-right">
          <label className="text-sm text-gray-300">Balance</label>
          <div className="text-lg font-medium">{balance} SOL</div>
        </div>
      </div>
    </div>
  );
}
