import { WatchlistItem } from '@/types';
import mongoose from 'mongoose';

export type WatchlistType = {
  userId: string;
  items: WatchlistItem[];
};

const WatchlistItemSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    unique: true,
  },
});

const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [WatchlistItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Watchlist ||
  mongoose.model('Watchlist', WatchlistSchema);
