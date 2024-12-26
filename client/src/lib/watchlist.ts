import { WatchlistItem } from '@/types';
import Watchlist, { WatchlistType } from '../models/Watchlist';
import dbConnect from './mongodb';

export async function getAllWatchlists(): Promise<WatchlistType[]> {
  await dbConnect();
  return Watchlist.find();
}

export async function getWatchlistForUser(
  userId: string
): Promise<WatchlistItem[]> {
  await dbConnect();
  const watchlist = await Watchlist.findOne({ userId });
  return watchlist ? watchlist.items : [];
}

export async function addToWatchlist(
  userId: string,
  item: WatchlistItem
): Promise<void> {
  await dbConnect();
  await Watchlist.findOneAndUpdate(
    { userId },
    { $push: { items: item } },
    { upsert: true, new: true }
  );
}

export async function removeFromWatchlist(
  userId: string,
  address: string
): Promise<void> {
  await dbConnect();
  await Watchlist.findOneAndUpdate(
    { userId },
    { $pull: { items: { address } } }
  );
}
