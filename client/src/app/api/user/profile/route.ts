import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  const walletAddress = request.headers.get('x-wallet-address');
  if (!walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ walletAddress });

  return NextResponse.json({
    email: user?.email || null,
    walletAddress,
  });
}

export async function POST(request: Request) {
  const walletAddress = request.headers.get('x-wallet-address');
  if (!walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await request.json();

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { walletAddress },
    {
      $set: { email },
      $setOnInsert: { walletAddress },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({
    email: user.email,
    walletAddress,
  });
}
