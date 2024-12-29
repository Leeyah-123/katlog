import dbConnect from '@/lib/mongodb';
import Watchlist, { WatchlistType } from '@/models/Watchlist';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();

  const watchlists = await Watchlist.find();
  const addresses = watchlists.reduce(
    (acc: string[], watchlist: WatchlistType) => {
      // Obtain the addresses from each watchlist item
      return [...acc, ...watchlist.items.map((item) => item.address)];
    },
    []
  );

  return NextResponse.json(addresses, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
