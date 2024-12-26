// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mainServerUrl: process.env.MAIN_SERVER_URL!,
  environment: process.env.NODE_ENV || 'development',
  email: {
    seamailerApiKey: process.env.SEAMAILER_API_KEY!,
    from: process.env.EMAIL_FROM!,
  },
};
