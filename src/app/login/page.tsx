'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        setError(data.error);
      }
    } catch {
      setError('An unexpected error occurred');
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
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
