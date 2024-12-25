import { compare, hash } from 'bcryptjs';
import { serialize } from 'cookie';
import { sign, verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '../models/User';
import dbConnect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  return await compare(password, hashedPassword);
}

export function generateToken(userId: string) {
  return sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
}

export function setTokenCookie(res: NextResponse, token: string) {
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
  res.headers.append('Set-Cookie', cookie);
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch {
    return null;
  }
}

export async function authenticateUser(token: string | undefined) {
  if (!token) {
    return null;
  }

  return await getUserFromToken(token);
}
