import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = (await params).id;

  await dbConnect();

  const user = await User.findOne({ _id: userId });
  return NextResponse.json(user, {
    headers: {
      'Access-Control-Allow-Origin':
        process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL!,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
