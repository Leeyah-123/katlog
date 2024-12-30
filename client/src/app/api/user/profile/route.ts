import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { extractAuth } from '../../utils';

export async function GET(request: Request) {
  const { walletAddress } = await extractAuth(request);
  if (!walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ walletAddress });

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const { walletAddress } = await extractAuth(request);
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
