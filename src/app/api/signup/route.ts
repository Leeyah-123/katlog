import { generateToken, hashPassword, setTokenCookie } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: 'User with provided email already exists' },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password);
  const result = await User.create({ email, password: hashedPassword });

  const token = generateToken(result._id.toString());
  const response = NextResponse.json({ success: true });
  setTokenCookie(response, token);

  return response;
}
