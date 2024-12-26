import { User } from '../core/types';

declare global {
  interface Error {
    data?: any;
    timeout?: number;
    statusCode: number;
  }

  namespace Express {
    interface Request {
      token?: string;
      user?: User;
    }
  }
}
