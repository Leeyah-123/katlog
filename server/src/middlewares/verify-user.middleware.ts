import type { Request, RequestHandler } from 'express';
import { config } from '../config';

export const verifyUser: RequestHandler = async (req, res, next) => {
  const token = extractToken(req);

  try {
    const response = await fetch(`${config.mainServerUrl}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = await response.json();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to authenticate user' });
  }
};

const extractToken = (req: Request): string | undefined => {
  // Check Authorization header first
  const authHeader = req.headers.authorization?.split(' ')[1];
  if (authHeader) return authHeader;

  // Check for token in cookies
  const cookieToken = req.cookies?.auth_token;
  return cookieToken;
};
