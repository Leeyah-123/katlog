import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePasswords, generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const passwordValid = await comparePasswords(password, user.password);
  if (!passwordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const token = generateToken(user._id.toString());
  const response = NextResponse.json({ success: true });
  setTokenCookie(response, token);

  return response;
}
