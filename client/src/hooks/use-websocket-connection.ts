import { useAuth } from '@/providers/auth-provider';
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
  const { userId } = useAuth();
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
      `${process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL}/api/webhook?clientId=${clientId}&userId=${userId}`
    );

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'transactions') {
        const newTransactions = message.data as AccountAction[];

        newTransactions.forEach((transaction) => {
          // Find all matching watchlist items for both from and to addresses
          const matchingWatchlistItems = watchlist.filter(
            (item) =>
              item.address === transaction.from ||
              item.address === transaction.to
          );

          // Process each matching watchlist item
          matchingWatchlistItems.forEach((item) => {
            const concernedAddress = item.address;

            // Add to latestTransactions
            setLatestTransactions((prev) => {
              // Ensure transaction has not been recorded yet for this specific concerned address
              const existingTransaction = prev.find(
                (tx) =>
                  tx.action.signature === transaction.signature &&
                  tx.concernedAddress === concernedAddress
              );

              if (!existingTransaction) {
                return [
                  ...prev,
                  {
                    concernedAddress,
                    label: item.label,
                    action: transaction,
                  },
                ];
              }
              return prev;
            });

            // Add to transactions Map
            setTransactions((prev) => {
              // Get or initialize transactions array for this address
              const addressTransactions = prev.get(concernedAddress) || [];

              // Check if transaction already exists for this address
              if (
                addressTransactions.some(
                  (tx) => tx.action.signature === transaction.signature
                )
              ) {
                return prev;
              }

              // Create new Map to trigger state update
              const newMap = new Map(prev);
              newMap.set(concernedAddress, [
                ...addressTransactions,
                {
                  concernedAddress,
                  label: item.label,
                  action: transaction,
                },
              ]);

              return newMap;
            });
          });
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
  }, [userId, watchlist]);

  return { latestTransactions, transactions };
};
