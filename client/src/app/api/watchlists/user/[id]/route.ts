import { extractAuth } from '@/app/api/utils';
import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, walletAddress } = await extractAuth(request);

  if (error || !walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (await params).id;

  await dbConnect();

  const watchlist = await Watchlist.findOne({ userId });
  return NextResponse.json(watchlist ? watchlist.items : []);
}
