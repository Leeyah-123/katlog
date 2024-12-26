import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { extractToken } from '../utils';

export async function GET(request: Request | NextRequest) {
  // Obtain token from request headers
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json(user);
}
