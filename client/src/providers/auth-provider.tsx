'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  walletAddress: string | null;
  email: string | null;
  setEmail: (email: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  walletAddress: null,
  email: null,
  setEmail: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isConnected: connected, status, address } = useAppKitAccount();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !address) {
      setUserId(null);
      setEmail(null);
      return;
    }

    const createUserIfNeeded = async () => {
      try {
        const profileResponse = await fetch('/api/user/profile', {
          headers: { 'x-wallet-address': address },
        });

        if (profileResponse.status === 401) {
          // User doesn't exist, create new user
          const createResponse = await fetch('/api/auth/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });

          if (!createResponse.ok) {
            console.error('Failed to create user');
            return null;
          }

          return createResponse.json();
        }

        return profileResponse.json();
      } catch (error) {
        console.error('Error in user authentication:', error);
        return null;
      }
    };

    createUserIfNeeded()
      .then((data) => {
        if (data) {
          setUserId(data._id);
          setEmail(data.email);
        }
      })
      .catch((error) => {
        console.error('Error in user setup:', error);
        setEmail(null);
      });
  }, [connected, status, address]);

  const value = {
    walletAddress: address || null,
    userId,
    email,
    setEmail,
    isAuthenticated: connected,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
