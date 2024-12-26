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
