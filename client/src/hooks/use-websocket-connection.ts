import { getTransactionConfirmationStatus } from '@/lib/solana';
import { useAuth } from '@/providers/auth-provider';
import { useWatchlist } from '@/providers/watchlist-provider';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const { watchlist, fetchWatchlist } = useWatchlist();

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

  const connect = useCallback(() => {
    if (!watchlist || !userId) return;

    const clientId = uuidv4();
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL}/api/webhook?clientId=${clientId}&userId=${userId}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      reconnectAttemptRef.current = 0; // Reset reconnection attempts
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
      scheduleReconnect();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Don't call scheduleReconnect here as onclose will be called after onerror
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, watchlist]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Exponential backoff with max delay of 30 seconds
    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttemptRef.current),
      30000
    );
    console.log(
      `Scheduling reconnect attempt ${
        reconnectAttemptRef.current + 1
      } in ${delay}ms`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptRef.current += 1;
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    if (watchlist === null) fetchWatchlist();
  }, [watchlist, fetchWatchlist]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { latestTransactions, transactions };
};
