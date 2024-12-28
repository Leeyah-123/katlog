import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

export const getSolanaAccountBalance = async (accountAddress: string) => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const wallet = new PublicKey(accountAddress);

  const balance = await connection.getBalance(wallet);

  return Number(balance) / LAMPORTS_PER_SOL;
};
