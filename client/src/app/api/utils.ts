import { Network } from '@/types';
import axios from 'axios';

export const extractAuth = async (req: Request) => {
  const walletAddress = req.headers.get('x-wallet-address');
  if (!walletAddress) {
    return { error: 'Missing wallet address' };
  }

  return { walletAddress };
};

interface WatchedAddress {
  address: string;
  networks: string[];
}

const getWatchedAddresses = async () => {
  const response = await axios.get(
    'https://api.quicknode.com/kv/rest/v1/sets/watchlist_addresses',
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUICKNODE_API_KEY!,
      },
    }
  );
  return JSON.parse(response.data.data.value || '[]') as WatchedAddress[];
};

export const addAddressToKVStore = async (
  address: string,
  networks: Network[]
) => {
  const watchedAddresses = await getWatchedAddresses();
  const existingIndex = watchedAddresses.findIndex(
    (item) => item.address === address
  );

  if (existingIndex >= 0) {
    watchedAddresses[existingIndex].networks = networks;
  } else {
    watchedAddresses.push({ address, networks });
  }

  await axios.post(
    'https://api.quicknode.com/kv/rest/v1/sets',
    {
      key: 'watchlist_addresses',
      value: JSON.stringify(watchedAddresses),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUICKNODE_API_KEY!,
      },
    }
  );

  return watchedAddresses;
};

export const removeAddressFromKVStore = async (
  address: string,
  network?: string
) => {
  const watchedAddresses = await getWatchedAddresses();
  const existingIndex = watchedAddresses.findIndex(
    (item) => item.address === address
  );

  if (existingIndex === -1) return watchedAddresses;

  if (network) {
    const networks = watchedAddresses[existingIndex].networks.filter(
      (net) => net !== network
    );
    if (networks.length > 0) {
      watchedAddresses[existingIndex].networks = networks;
    } else {
      watchedAddresses.splice(existingIndex, 1);
    }
  } else {
    watchedAddresses.splice(existingIndex, 1);
  }

  await axios.post(
    'https://api.quicknode.com/kv/rest/v1/sets',
    {
      key: 'watchlist_addresses',
      value: JSON.stringify(watchedAddresses),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUICKNODE_API_KEY!,
      },
    }
  );

  return watchedAddresses;
};
