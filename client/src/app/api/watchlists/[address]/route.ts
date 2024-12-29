import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import {
  addAddressToKVStore,
  extractToken,
  removeAddressFromKVStore,
} from '../../utils';

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
    const watchlist = await Watchlist.findOne({ userId: user._id });
    if (!watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      );
    }

    // Check for duplicates if address or label is being updated
    if (updates.address && updates.address !== oldAddress) {
      const addressExists = watchlist.items.some(
        (item: { address: string }) =>
          item.address.toLowerCase() === updates.address.toLowerCase() &&
          item.address.toLowerCase() !== oldAddress.toLowerCase()
      );
      if (addressExists) {
        return NextResponse.json(
          { error: 'This address is already in your watchlist' },
          { status: 400 }
        );
      }
    }

    if (updates.label) {
      const labelExists = watchlist.items.some(
        (item: { label: string; address: string }) =>
          item.label.toLowerCase() === updates.label.toLowerCase() &&
          item.address.toLowerCase() !== oldAddress.toLowerCase()
      );
      if (labelExists) {
        return NextResponse.json(
          { error: 'This label is already in use' },
          { status: 400 }
        );
      }
    }

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

    if (updates.address && updates.address !== oldAddress) {
      await Promise.all([
        removeAddressFromKVStore(oldAddress),
        addAddressToKVStore(updates.address),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch {
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
  const address = (await params).address;

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
      { $pull: { items: { address } } }
    );

    await removeAddressFromKVStore(address);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('Unable to delete watchlist item', error);
    return NextResponse.json(
      { error: 'Failed to delete watchlist item' },
      { status: 500 }
    );
  }
}
