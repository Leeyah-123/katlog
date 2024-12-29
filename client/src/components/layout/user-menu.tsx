'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-provider';
import { User } from 'lucide-react';
import Link from 'next/link';
import { Confirm } from 'notiflix';

interface UserMenuProps {
  email: string | null;
  isMobile?: boolean;
}

export function UserMenu({ email, isMobile }: UserMenuProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Confirm.show(
      'Log out',
      'Are you sure you want to log out?',
      'Yes',
      'No',
      async () => {
        await logout();
      }
    );
  };

  if (!email && isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="space-x-2">
        <Button asChild variant="outline">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Logged in as {email}</DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            onClick={handleLogout}
            className="w-full ghost cursor-pointer"
          >
            Log Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
