import { getUserFromWalletAddress } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { extractAuth } from '../utils';

export async function GET(request: Request | NextRequest) {
  // Obtain token from request headers
  const { error, walletAddress } = await extractAuth(request);

  if (error || !walletAddress) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserFromWalletAddress(walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json(user);
}
