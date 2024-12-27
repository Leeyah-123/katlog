import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import { extractToken } from '../../utils';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();
  const oldAddress = (await params).address;

  await dbConnect();

  try {
    const result = await Watchlist.findOneAndUpdate(
      {
        userId: user._id,
        'items.address': oldAddress,
      },
      {
        $set: {
          'items.$.address': updates.address || oldAddress,
          'items.$.label': updates.label,
          'items.$.emailNotifications': updates.emailNotifications,
        },
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const token = await extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    await Watchlist.findOneAndUpdate(
      { userId: user._id },
      { $pull: { items: { address: (await params).address } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting watchlist item:', error);
    return NextResponse.json(
      { error: 'Failed to delete watchlist item' },
      { status: 500 }
    );
  }
}
