import { authenticateUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import {
  addAddressToKVStore,
  extractAuth,
  removeAddressFromKVStore,
} from '../../utils';

// Helper function to check if address is watched by other users
async function isAddressWatchedByOthers(
  address: string,
  currentUserId: string
) {
  const watchers = await Watchlist.find({
    userId: { $ne: currentUserId },
    'items.address': address,
  });
  return watchers.length > 0;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { error, walletAddress } = await extractAuth(request);

  if (error || !walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(walletAddress);
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

    if (updates.emailNotifications && !user.email) {
      return NextResponse.json(
        { error: 'Update email in profile to enable email notifications' },
        { status: 400 }
      );
    }

    const result = await Watchlist.findOne({
      userId: user._id,
      'items.address': oldAddress,
    });
    if (!result) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    if (updates.address && updates.address !== oldAddress) {
      // Add new address to KV store first
      await addAddressToKVStore(updates.address);

      // Only remove old address if no one else is watching it
      const isWatched = await isAddressWatchedByOthers(
        oldAddress,
        user._id.toString()
      );
      if (!isWatched) {
        await removeAddressFromKVStore(oldAddress);
      }
    }

    await Watchlist.findOneAndUpdate(
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
    ).catch(async () => {
      // If update fails, clean up the new address from KV store
      await removeAddressFromKVStore(updates.address);
      throw new Error();
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const address = (await params).address;

  const { error, walletAddress } = await extractAuth(request);

  if (error || !walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await authenticateUser(walletAddress);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    await Watchlist.findOneAndUpdate(
      { userId: user._id },
      { $pull: { items: { address } } }
    );

    // Only remove from KV store if no other users are watching
    const isWatched = await isAddressWatchedByOthers(
      address,
      user._id.toString()
    );
    if (!isWatched) {
      await removeAddressFromKVStore(address).catch((error) => {
        console.log('Unable to remove address from KV store', error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('Unable to delete watchlist item', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
