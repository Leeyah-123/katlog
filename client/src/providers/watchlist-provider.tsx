'use client';

import { WatchlistItem } from '@/types';
import { useRouter } from 'next/navigation';
import { Notify } from 'notiflix';
import React, { createContext, useCallback, useContext, useState } from 'react';

type WatchlistContextType = {
  watchlist: WatchlistItem[] | null;
  loading: boolean;
  addToWatchlist: (
    address: string,
    label: string,
    emailNotifications: boolean
  ) => Promise<boolean>;
  removeFromWatchlist: (address: string) => Promise<boolean>;
  updateWatchlistItem: (
    oldAddress: string,
    item: Partial<WatchlistItem>
  ) => Promise<boolean>;
  fetchWatchlist: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlists/user');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const addToWatchlist = async (
    address: string,
    label: string,
    emailNotifications: boolean
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label, emailNotifications }),
      });

      if (response.status === 401) {
        router.push('/login');
        return false;
      }

      if (response.ok) {
        await fetchWatchlist();
        return true;
      } else {
        Notify.failure(
          'Unable to add account to watchlist. Please try again later.'
        );
      }

      return false;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Notify.failure(
        'Unable to add account to watchlist. Please try again later.'
      );
      return false;
    }
  };

  const removeFromWatchlist = async (address: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/watchlists/${address}`, {
        method: 'DELETE',
      });
      if (response.status === 401) {
        router.push('/login');
        return false;
      }
      if (response.ok) {
        await fetchWatchlist();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  const updateWatchlistItem = async (
    oldAddress: string,
    item: Partial<WatchlistItem>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/watchlists/${oldAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.status === 401) {
        router.push('/login');
        return false;
      }

      if (response.ok) {
        await fetchWatchlist();
        return true;
      } else {
        Notify.failure(
          'Failed to update watchlist item. Please try again later.'
        );
      }

      return false;
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      return false;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist: watchlist,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchlistItem,
        fetchWatchlist,
      }}
    >
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
