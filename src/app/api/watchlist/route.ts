import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const watchlist = await Watchlist.findOne({ userId: user._id });
  return NextResponse.json(watchlist ? watchlist.items : []);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;

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
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;

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
