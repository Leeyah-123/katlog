import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextRequest, NextResponse } from 'next/server';
import { extractAuth } from '../../utils';

export async function GET(request: NextRequest) {
  const { walletAddress } = await extractAuth(request);

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!walletAddress || !address) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const user = await authenticateUser(walletAddress);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlist = await Watchlist.findOne({
      userId: user._id,
      'items.address': address,
    });

    return NextResponse.json({
      exists: !!watchlist,
    });
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to check watchlist' },
      { status: 500 }
    );
  }
}
