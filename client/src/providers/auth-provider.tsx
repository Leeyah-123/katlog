'use client';

import { useRouter } from 'next/navigation';
import { Notify } from 'notiflix';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface AuthContextType {
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setEmail(data.email);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setEmail(email);
        router.push('/watchlist');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Login unsuccessful');
      }
    } catch (error) {
      Notify.failure(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setEmail(email);
        router.push('/watchlist');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Signup unsuccessful');
      }
    } catch (error) {
      Notify.failure(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setEmail(null);
        router.push('/login');
      }
    } catch {
      Notify.failure('Logout failed');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ email, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
