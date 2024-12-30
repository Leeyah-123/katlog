import User from '@/models/User';
import dbConnect from './mongodb';

export async function getUserFromWalletAddress(walletAddress: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ walletAddress });
    return user;
  } catch {
    return null;
  }
}

export async function authenticateUser(walletAddress: string | undefined) {
  if (!walletAddress) {
    return null;
  }

  return await getUserFromWalletAddress(walletAddress);
}
