import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import { addAddressToKVStore, extractAuth } from '../utils';

export async function GET() {
  await dbConnect();

  const watchlists = await Watchlist.find();
  return NextResponse.json(watchlists, {
    headers: {
      'Access-Control-Allow-Origin':
        process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL!,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  const { error, walletAddress } = await extractAuth(request);

  if (error || !walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address, label, emailNotifications } = await request.json();

  await dbConnect();

  // Check for existing address or label
  const existingWatchlist = await Watchlist.findOne({ userId: user._id });
  if (existingWatchlist) {
    const addressExists = existingWatchlist.items.some(
      (item: { address: string }) =>
        item.address.toLowerCase() === address.toLowerCase()
    );
    if (addressExists) {
      return NextResponse.json(
        { error: 'This address is already in your watchlist' },
        { status: 400 }
      );
    }

    const labelExists = existingWatchlist.items.some(
      (item: { label: string }) =>
        item.label.toLowerCase() === label.toLowerCase()
    );
    if (labelExists) {
      return NextResponse.json(
        { error: 'This label is already in use' },
        { status: 400 }
      );
    }
  }

  if (emailNotifications && !user.email) {
    return NextResponse.json(
      { error: 'Update email in profile to enable email notifications' },
      { status: 400 }
    );
  }

  try {
    await Watchlist.findOneAndUpdate(
      { userId: user._id },
      { $push: { items: { address, label, emailNotifications } } },
      { upsert: true, new: true }
    );

    await addAddressToKVStore(address);

    return NextResponse.json({ address, label, emailNotifications });
  } catch (error) {
    console.error('Error adding account to watchlist', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
