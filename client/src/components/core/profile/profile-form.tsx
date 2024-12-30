'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { validateEmail } from '@/utils/validation';
import { Notify } from 'notiflix';
import { useEffect, useState } from 'react';

type ProfileFormProps = {
  initialEmail: string | null;
};

export function ProfileForm({ initialEmail }: ProfileFormProps) {
  const { email, setEmail, walletAddress } = useAuth();
  const [newEmail, setNewEmail] = useState(email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [setEmail, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { valid, error } = validateEmail(newEmail);
      if (!valid) {
        Notify.failure(error || 'Please enter a valid email address');
        return;
      }

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress || '',
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'An unexpected error occurred');
      }

      setEmail(newEmail);
      Notify.success('Email updated successfully');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        Notify.failure(error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Enter your email for notifications"
        className="bg-white/5 border-white/10"
        disabled={isSubmitting}
        required
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {isSubmitting ? 'Saving...' : 'Save Email'}
      </Button>
    </form>
  );
}
