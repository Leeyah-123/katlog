import { Connection, PublicKey } from '@solana/web3.js';

const quicknodeUrl = process.env.QUICKNODE_RPC_URL;

if (!quicknodeUrl) {
  throw new Error(
    'QuickNode RPC URL or API Key not found in environment variables'
  );
}

export const connection = new Connection(quicknodeUrl, 'confirmed');

export async function fetchAccountHistory(address: string) {
  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(address),
    {
      limit: 20,
    }
  );

  const transactions = await Promise.all(
    signatures.map(async (sig) => {
      const tx = await connection.getTransaction(sig.signature);
      return {
        signature: sig.signature,
        timestamp: sig.blockTime,
        type:
          tx?.transaction.message
            .programIds()
            [
              tx?.transaction.message.instructions[0].programIdIndex
            ]?.toString() || 'Unknown',
        amount: tx?.meta?.fee || 0,
        from: tx?.transaction.message.accountKeys[0].toString() || '',
        to: tx?.transaction.message.accountKeys[1]?.toString() || '',
        description: 'Transaction',
      };
    })
  );

  return transactions;
}

export async function fetchTransactionDetails(signature: string) {
  const tx = await connection.getTransaction(signature);
  if (!tx) {
    throw new Error('Transaction not found');
  }

  return {
    signature,
    timestamp: tx.blockTime,
    type:
      tx?.transaction.message
        .programIds()
        [tx?.transaction.message.instructions[0].programIdIndex]?.toString() ||
      'Unknown',
    amount: tx.meta?.fee || 0,
    from: tx.transaction.message.accountKeys[0].toString(),
    to: tx.transaction.message.accountKeys[1]?.toString() || '',
    description: 'Transaction',
    instructions: tx.transaction.message.instructions,
    logs: tx.meta?.logMessages || [],
  };
}
