import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { extractAuth } from '../../utils';
import { getUserFromWalletAddress } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await extractAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const user = await getUserFromWalletAddress(auth.walletAddress);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 401 }
    );
  }

  await dbConnect();

  const watchlist = await Watchlist.findOne({ userId: user._id });
  return NextResponse.json(watchlist ? watchlist.items : []);
}
