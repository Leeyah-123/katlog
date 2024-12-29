'use client';

import TransactionsTable from '@/components/shared/transactions-table';
import { useWebSocketConnection } from '@/hooks/use-websocket-connection';
import { useEffect, useRef } from 'react';
import { useAudioNotification } from '@/hooks/use-audio-notification';
import { NotificationPrompt } from '@/components/shared/notification-prompt';

interface AccountActionsProps {
  address: string;
}

export default function AccountActions({ address }: AccountActionsProps) {
  const { transactions } = useWebSocketConnection();
  const accountTransactions = transactions.get(address);
  const prevTransactionCountRef = useRef(0);

  const {
    audioRef,
    showPermissionPrompt,
    setShowPermissionPrompt,
    enableNotifications,
    playNotification,
  } = useAudioNotification();

  useEffect(() => {
    if (!accountTransactions) return;

    if (accountTransactions.length > prevTransactionCountRef.current) {
      playNotification();
    }
    prevTransactionCountRef.current = accountTransactions.length;
  }, [accountTransactions, playNotification]);

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" className="hidden" />
      <NotificationPrompt
        open={showPermissionPrompt}
        onClose={() => setShowPermissionPrompt(false)}
        onEnable={enableNotifications}
      />
      <TransactionsTable transactions={accountTransactions ?? []} />
    </>
  );
}
