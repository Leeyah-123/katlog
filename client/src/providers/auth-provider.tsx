'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  walletAddress: string | null;
  email: string | null;
  setEmail: (email: string | null) => void;
  isAuthenticated: boolean;
  signMessage: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  walletAddress: null,
  email: null,
  setEmail: () => {},
  isAuthenticated: false,
  signMessage: async () => '',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { connected, publicKey, signMessage } = useWallet();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetch('/api/user/profile', {
        headers: { 'x-wallet-address': publicKey.toBase58() },
      })
        .then((res) => res.json())
        .then((data) => {
          setUserId(data._id);
          setEmail(data.email);
        })
        .catch(() => setEmail(null));
    }
  }, [connected, publicKey]);

  const handleSignMessage = async () => {
    if (!signMessage || !publicKey) throw new Error('Wallet not connected');

    const message = new TextEncoder().encode(
      `Authenticate with Katlog: ${Date.now()}`
    );
    const signature = await signMessage(message);
    return bs58.encode(signature);
  };

  const value = {
    walletAddress: publicKey?.toBase58() || null,
    userId,
    email,
    setEmail,
    isAuthenticated: connected,
    signMessage: handleSignMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
