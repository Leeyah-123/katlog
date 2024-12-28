'use client';

import { WatchlistItem } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useState } from 'react';

type WatchlistContextType = {
  watchlist: WatchlistItem[] | null;
  loading: boolean;
  addToWatchlist: (
    address: string,
    label: string,
    emailNotifications: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  removeFromWatchlist: (
    address: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateWatchlistItem: (
    oldAddress: string,
    item: Partial<WatchlistItem>
  ) => Promise<{ success: boolean; error?: string }>;
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
    } finally {
      setLoading(false);
    }
  }, [router]);

  const addToWatchlist = async (
    address: string,
    label: string,
    emailNotifications: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label, emailNotifications }),
      });

      if (response.status === 401) {
        router.push('/login');
        return { success: false, error: 'Unauthorized' };
      }

      if (response.ok) {
        await fetchWatchlist();
        return { success: true };
      }

      const data = await response.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const removeFromWatchlist = async (
    address: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/watchlists/${address}`, {
        method: 'DELETE',
      });
      if (response.status === 401) {
        router.push('/login');
        return { success: false, error: 'Unauthorized' };
      }
      if (response.ok) {
        await fetchWatchlist();
        return { success: true };
      }

      const data = await response.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateWatchlistItem = async (
    oldAddress: string,
    item: Partial<WatchlistItem>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/watchlists/${oldAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.status === 401) {
        router.push('/login');
        return { success: false, error: 'Unauthorized' };
      }

      if (response.ok) {
        await fetchWatchlist();
        return { success: true };
      }

      const data = await response.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
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
