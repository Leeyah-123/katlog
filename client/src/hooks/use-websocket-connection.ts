import { useWatchlist } from '@/providers/watchlist-provider';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AccountAction } from '../types';

export type WatchlistAccountTransaction = {
  concernedAddress: string;
  label: string;
  action: AccountAction;
};

export const useWebSocketConnection = () => {
  const [transactions, setTransactions] = useState<
    Map<string, WatchlistAccountTransaction[]>
  >(new Map());
  const [latestTransactions, setLatestTransactions] = useState<
    WatchlistAccountTransaction[]
  >([]);

  const { watchlist, fetchWatchlist } = useWatchlist();

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);

  useEffect(() => {
    if (!watchlist) return;

    const clientId = uuidv4();
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL}/api/webhook?clientId=${clientId}`
    );

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'transaction') {
        const newTransactions = message.data as AccountAction[];

        // Filter transactions we don't need
        newTransactions.filter((transaction) => {
          for (const item of watchlist) {
            if (
              item.address === transaction.from ||
              item.address === transaction.to
            ) {
              const concernedAddress =
                transaction.from === item.address
                  ? transaction.to
                  : transaction.from;

              setLatestTransactions((prev) => {
                // Ensure transaction has not been recorded yet
                const existingTransaction = prev.find(
                  (tx) =>
                    tx.action.signature === transaction.signature &&
                    tx.concernedAddress === concernedAddress
                );
                if (!existingTransaction) {
                  prev.push({
                    concernedAddress,
                    label: item.label,
                    action: transaction,
                  });
                }

                return prev;
              });
              setTransactions((prev) => {
                // Ensure transaction has not been recorded for this address yet
                const existingTransactions = prev.get(concernedAddress) || [];
                if (
                  existingTransactions.some(
                    (tx) => tx.action.signature === transaction.signature
                  )
                ) {
                  return prev;
                }

                if (!prev.has(concernedAddress)) {
                  prev.set(concernedAddress, []);
                }
                prev.get(concernedAddress)!.push({
                  concernedAddress,
                  label: item.label,
                  action: transaction,
                });
                return new Map(prev);
              });
            }
          }
        });
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [watchlist]);

  return { latestTransactions, transactions };
};
