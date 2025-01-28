'use client';

import { NETWORKS, WatchlistItem } from '@/types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './auth-provider';

type WatchlistContextType = {
  watchlist: WatchlistItem[] | null;
  loading: boolean;
  error: string | null;
  addToWatchlist: (
    address: string,
    label: string,
    emailNotifications: boolean,
    watchedNetworks: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  removeFromWatchlist: (
    address: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateWatchlistItem: (
    oldAddress: string,
    item: Partial<WatchlistItem>
  ) => Promise<{ success: boolean; error?: string }>;
  fetchWatchlist: () => Promise<void>;
  checkAddress: (address: string) => Promise<boolean>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { walletAddress, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated || !walletAddress) {
      setWatchlist(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/watchlists/user', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || '');
      }

      const data = await response.json();
      setWatchlist(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);

      if (error instanceof Error) {
        setError(
          error.message ||
            'An unexpected error occurred while fetching watchlist'
        );
      } else setError('An unexpected error occurred while fetching watchlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, walletAddress]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(
    async (
      address: string,
      label: string,
      enableEmailNotifications: boolean,
      watchedNetworks: string[]
    ) => {
      if (!walletAddress) {
        return { success: false, error: 'Wallet not connected' };
      }

      setLoading(true);

      try {
        const response = await fetch('/api/watchlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress,
          },
          body: JSON.stringify({
            address,
            label,
            emailNotifications: enableEmailNotifications,
            watchedNetworks,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          return {
            success: false,
            error: error.error || 'An unexpected error occurred',
          };
        }

        const data = await response.json();
        setWatchlist((prev) => [...(prev || []), data]);
        return { success: true };
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        };
      } finally {
        setLoading(false);
      }
    },
    [walletAddress]
  );

  const removeFromWatchlist = useCallback(
    async (address: string) => {
      if (!walletAddress)
        return { success: false, error: 'Wallet not connected' };

      setLoading(true);

      try {
        const response = await fetch(`/api/watchlists/${address}`, {
          method: 'DELETE',
          headers: {
            'x-wallet-address': walletAddress,
          },
        });

        if (response.ok) {
          await fetchWatchlist();
          return { success: true };
        }

        const data = await response.json();
        return { success: false, error: data.error };
      } catch {
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, fetchWatchlist]
  );

  const updateWatchlistItem = useCallback(
    async (address: string, updates: Partial<WatchlistItem>) => {
      if (!walletAddress)
        return { success: false, error: 'Wallet not connected' };

      // Validate networks if they're being updated
      if (updates.watchedNetworks) {
        const invalidNetwork = updates.watchedNetworks.find(
          (network) => !NETWORKS.includes(network)
        );
        if (invalidNetwork) {
          return {
            success: false,
            error: `Invalid network: ${invalidNetwork}`,
          };
        }
      }

      setLoading(true);

      try {
        const response = await fetch(`/api/watchlists/${address}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress,
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          await fetchWatchlist();
          return { success: true };
        }

        const data = await response.json();
        return { success: false, error: data.error };
      } catch {
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, fetchWatchlist]
  );

  const checkAddress = useCallback(
    async (address: string) => {
      if (!walletAddress) return false;

      try {
        const response = await fetch(
          `/api/watchlists/check?address=${address}`,
          {
            headers: {
              'x-wallet-address': walletAddress,
            },
          }
        );

        if (!response.ok) return false;

        const data = await response.json();
        return data.exists;
      } catch (error) {
        console.error('Error checking address:', error);
        return false;
      }
    },
    [walletAddress]
  );

  const value = {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    fetchWatchlist,
    checkAddress,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
