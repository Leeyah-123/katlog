import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      walletAddress,
      email: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await User.create(newUser);

    return NextResponse.json({
      _id: result.insertedId,
      ...newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
