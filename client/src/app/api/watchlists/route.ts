import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import { extractToken } from '../utils';

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
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address, label, emailNotifications } = await request.json();

  await dbConnect();

  await Watchlist.findOneAndUpdate(
    { userId: user._id },
    { $push: { items: { address, label, emailNotifications } } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
