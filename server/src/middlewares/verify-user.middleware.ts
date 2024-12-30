import { NextFunction, Request, Response } from 'express';

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const walletAddress = req.headers['x-wallet-address'];

  if (!walletAddress) {
    return res.status(401).json({ error: 'Missing wallet address' });
  }

  // Add the wallet address to the request object
  req.user = { walletAddress: walletAddress as string };
  next();
};
