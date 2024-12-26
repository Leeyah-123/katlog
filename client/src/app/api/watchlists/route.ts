import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import { extractToken } from '../utils';

export async function GET(request: Request) {
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const watchlists = await Watchlist.find();
  return NextResponse.json(watchlists);
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

  const { address, label } = await request.json();

  await dbConnect();

  await Watchlist.findOneAndUpdate(
    { userId: user._id },
    { $push: { items: { address, label } } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address } = await request.json();

  await dbConnect();

  await Watchlist.findOneAndUpdate(
    { userId: user._id },
    { $pull: { items: { address } } }
  );

  return NextResponse.json({ success: true });
}