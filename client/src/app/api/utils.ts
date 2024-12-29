import { cookies } from 'next/headers';

export const extractToken = async (
  req: Request
): Promise<string | undefined> => {
  const cookieStore = cookies();
  let token = (await cookieStore).get('token')?.value;
  if (token) return token;

  token = req.headers.get('Authorization')?.split(' ')[1];
  return token;
};

const getWatchedAddresses = async () => {
  const response = await fetch(
    'https://api.quicknode.com/kv/rest/v1/lists/watchlist_addresses',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUICKNODE_API_KEY!,
      },
    }
  );
  const data = await response.json();
  return data.data.items;
};

export const addAddressToKVStore = async (address: string) => {
  const watchedAddresses = await getWatchedAddresses();

  const uniqueAddresses = new Set([...watchedAddresses, address]);

  await fetch('https://api.quicknode.com/kv/rest/v1/lists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.QUICKNODE_API_KEY!,
    },
    body: JSON.stringify({
      key: 'watchlist_addresses',
      items: [...uniqueAddresses],
    }),
  });

  return [...uniqueAddresses];
};

export const removeAddressFromKVStore = async (address: string) => {
  const watchedAddresses = await getWatchedAddresses();

  const filteredAddresses = watchedAddresses.filter(
    (item: string) => item !== address
  );

  await fetch('https://api.quicknode.com/kv/rest/v1/lists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.QUICKNODE_API_KEY!,
    },
    body: JSON.stringify({
      key: 'watchlist_addresses',
      items: [...filteredAddresses],
    }),
  });

  return filteredAddresses;
};
