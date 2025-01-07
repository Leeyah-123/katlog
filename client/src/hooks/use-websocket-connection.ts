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
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const { watchlist, fetchWatchlist } = useWatchlist();

  // Retry counter map
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Calculate interval based on retry count
  const getCheckInterval = (retryCount: number) => {
    const baseInterval = 5000; // 5 seconds
    const multiplier = Math.floor(retryCount / 10);
    return baseInterval * (multiplier + 1);
  };

  const updateTransactionStatus = useCallback(async (signature: string) => {
    try {
      const status = await getTransactionConfirmationStatus(signature);

      // Reset retry count on successful update
      if (status === 'finalized') {
        retryCountRef.current.delete(signature);
      }

      setTransactions((prev) => {
        const newMap = new Map(prev);
        prev.forEach((txs, address) => {
          newMap.set(
            address,
            txs.map((tx) =>
              tx.action.signature === signature && tx.action.status !== status
                ? { ...tx, action: { ...tx.action, status } }
                : tx
            )
          );
        });
        return newMap;
      });
    } catch (err) {
      console.error('Failed to update transaction status:', err);
      // Increment retry count on failure
      const currentRetries = (retryCountRef.current.get(signature) || 0) + 1;
      retryCountRef.current.set(signature, currentRetries);
    }
  }, []);

  // Update status checking interval with progressive delays
  useEffect(() => {
    const checkStatuses = () => {
      transactions.forEach((txs) => {
        txs.forEach((tx) => {
          if (tx.action.status !== 'finalized') {
            const retryCount =
              retryCountRef.current.get(tx.action.signature) || 0;
            const interval = getCheckInterval(retryCount);

            // Only update if enough time has passed since last retry
            const lastCheck = tx.action.lastStatusCheck || 0;
            const now = Date.now();
            if (now - lastCheck >= interval) {
              updateTransactionStatus(tx.action.signature);
              // Update lastStatusCheck timestamp
              setTransactions((prev) => {
                const newMap = new Map(prev);
                prev.forEach((addressTxs, address) => {
                  newMap.set(
                    address,
                    addressTxs.map((addressTx) =>
                      addressTx.action.signature === tx.action.signature
                        ? {
                            ...addressTx,
                            action: {
                              ...addressTx.action,
                              lastStatusCheck: now,
                            },
                          }
                        : addressTx
                    )
                  );
                });
                return newMap;
              });
            }
          }
        });
      });
    };

    const interval = setInterval(checkStatuses, 1000); // Check every second, but respect individual transaction intervals
    return () => clearInterval(interval);
  }, [transactions, updateTransactionStatus]);

  // Clean up retry counts when component unmounts
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      retryCountRef.current.clear();
    };
  }, []);

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
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'transactions') {
        const newTransactions = message.data as AccountAction[];

        newTransactions.forEach((transaction) => {
          transaction.status = 'processed';

          updateTransactionStatus(transaction.signature).catch((err) => {
            console.error(
              'Failed to perform initial status check for transaction:',
              err
            );
          });

          const matchingWatchlistItems = watchlist.filter(
            (item) =>
              item.address === transaction.from ||
              item.address === transaction.to
          );

          matchingWatchlistItems.forEach((item) => {
            const concernedAddress = item.address;

            setTransactions((prev) => {
              const addressTxs = prev.get(concernedAddress) || [];

              if (
                addressTxs.some(
                  (tx) => tx.action.signature === transaction.signature
                )
              ) {
                return prev;
              }

              const newMap = new Map(prev);
              newMap.set(concernedAddress, [
                {
                  concernedAddress,
                  label: item.label,
                  action: transaction,
                },
                ...addressTxs, // Add new transactions at the beginning
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
      setConnectionStatus('disconnected');
    };

    ws.onerror = (error) => {
      if (window !== undefined) {
        console.error('WebSocket error:', error);
      }
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

  return { transactions, connectionStatus };
};
