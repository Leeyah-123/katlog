'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import * as motion from 'motion/react-client';
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
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-300 text-center">
                Start monitoring your Solana portfolio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-400 hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <LogIn className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="text-purple-300 hover:text-purple-200"
                >
                  Sign in
                </a>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </form>{' '}
    </div>
  );
}
