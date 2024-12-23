'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
      const res = await fetch('/api/user');
      if (res.ok) {
        // User is logged in, redirect to watchlist
        router.push('/watchlist');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/waitlist');
      } else {
        const data = await response.json();
        toast.toast({
          title: 'Login unsuccessful',
          description: data.error,
        });
      }
    } catch {
      toast.toast({
        title: 'Login unsuccessful',
        description: 'An unexpected error occurred',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4 text-high-contrast-text">
        Log In
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            'glassmorphism text-high-contrast-text placeholder-high-contrast-text/70 border-white/20'
          )}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            'glassmorphism text-high-contrast-text placeholder-high-contrast-text/70 border-white/20'
          )}
        />
        <Button
          type="submit"
          className={cn(
            'w-full bg-gradient-to-r from-solana-green to-solana-purple text-high-contrast-text font-semibold hover:opacity-90 transition-opacity'
          )}
        >
          Log In
        </Button>
      </form>
    </div>
  );
}
