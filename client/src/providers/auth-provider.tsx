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
  loading: boolean;
  signMessage: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  walletAddress: null,
  email: null,
  setEmail: () => {},
  isAuthenticated: false,
  loading: false,
  signMessage: async () => '',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { connected, publicKey, signMessage, connecting } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connecting) return;

    if (connected && publicKey) {
      handleWalletConnect(publicKey.toBase58());
    } else {
      setWalletAddress(null);
      setUserId(null);
      setEmail(null);

      setLoading(false);
    }
  }, [connecting, connected, publicKey]);

  const handleWalletConnect = async (address: string) => {
    // TODO: Better error handling
    setLoading(true);
    try {
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (response.ok) {
        setWalletAddress(address);
        setUserId(data._id);
        setEmail(data.email);
      } else if (response.status === 404) {
        // Create a new account for the wallet address
        const createResponse = await fetch('/api/auth/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        });

        const createData = await createResponse.json();

        if (createResponse.ok) {
          setWalletAddress(address);
          setUserId(createData._id);
          setEmail(createData.email);
        }
      }
    } catch (error) {
      console.error('Failed to authenticate wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignMessage = async () => {
    if (!signMessage || !publicKey) throw new Error('Wallet not connected');

    const message = new TextEncoder().encode(
      `Authenticate with Katlog: ${Date.now()}`
    );
    const signature = await signMessage(message);
    return bs58.encode(signature);
  };

  const value = {
    walletAddress,
    userId,
    email,
    setEmail,
    isAuthenticated: connected,
    loading,
    signMessage: handleSignMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
