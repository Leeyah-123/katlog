'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notify } from 'notiflix';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signup, checkAuth } = useAuth();

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        router.push('/watchlist');
      }
    };
    redirectIfLoggedIn();
  }, [router, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid: isEmailValid, error: emailError } = validateEmail(email);
    if (!isEmailValid) {
      Notify.failure(emailError!);
    }

    const { valid: isPasswordValid, error: passwordError } =
      validatePassword(password);
    if (!isPasswordValid) {
      Notify.failure(passwordError!);
    }

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await signup(email, password);
    } catch {
      // Error is handled by the AuthProvider
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'glassmorphism placeholder:text-foreground/70 border-white/20'
            )}
          />
        </div>

        <div className="space-y-1">
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
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 hover:bg-foreground/20 rounded-md'
              )}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className={cn(
            'w-full bg-gradient-to-r from-solana-green to-solana-purple font-semibold hover:opacity-90 text-foreground transition-opacity'
          )}
        >
          Sign Up
        </Button>
      </form>
    </div>
  );
}
