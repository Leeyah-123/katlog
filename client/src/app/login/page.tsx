'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        router.push('/watchlist');
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
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            'glassmorphism placeholder:text-foreground/70 border-white/20'
          )}
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              'glassmorphism placeholder:text-foreground/70 border-white/20'
            )}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 hover:bg-foreground/20 rounded-md'
            )}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>

        <Button
          type="submit"
          className={cn(
            'w-full bg-gradient-to-r from-solana-green to-solana-purple font-semibold hover:opacity-90 text-foreground transition-opacity'
          )}
        >
          Log In
        </Button>
      </form>
    </div>
  );
}
