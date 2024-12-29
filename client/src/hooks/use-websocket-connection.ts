import { getTransactionStatus as getTransactionConfirmationStatus } from '@/lib/solana';
import { useAuth } from '@/providers/auth-provider';
import { useWatchlist } from '@/providers/watchlist-provider';
import { Notify } from 'notiflix';
import { useEffect, useState, useCallback } from 'react';
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

  const updateTransactionStatus = useCallback(async (signature: string) => {
    try {
      const status = await getTransactionConfirmationStatus(signature);

      // Update latestTransactions
      setLatestTransactions((prev) =>
        prev.map((tx) => {
          if (
            tx.action.signature === signature &&
            tx.action.status !== status
          ) {
            return { ...tx, action: { ...tx.action, status } };
          }
          return tx;
        })
      );

      // Update transactions Map
      setTransactions((prev) => {
        const newMap = new Map(prev);
        prev.forEach((txs, address) => {
          newMap.set(
            address,
            txs.map((tx) => {
              if (
                tx.action.signature === signature &&
                tx.action.status !== status
              ) {
                return { ...tx, action: { ...tx.action, status } };
              }
              return tx;
            })
          );
        });
        return newMap;
      });
    } catch (err) {
      console.error('Failed to update transaction status:', err);
    }
  }, []);

  // Add status checking interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Check all transactions in latestTransactions
      latestTransactions.forEach((tx) => {
        if (tx.action.status !== 'finalized') {
          updateTransactionStatus(tx.action.signature);
        }
      });

      // Check all transactions in transactions Map
      transactions.forEach((txs) => {
        txs.forEach((tx) => {
          if (tx.action.status !== 'finalized') {
            updateTransactionStatus(tx.action.signature);
          }
        });
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [latestTransactions, transactions, updateTransactionStatus]);

  useEffect(() => {
    if (!watchlist || !userId) return;

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
          // Initial status check
          updateTransactionStatus(transaction.signature);

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
      Notify.failure(
        'Unable to connect to websocket. Please refresh the page.'
      );
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [userId, watchlist, updateTransactionStatus]);

  return { latestTransactions, transactions };
};
