// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mainServerUrl: process.env.MAIN_SERVER_URL!,
  environment: process.env.NODE_ENV || 'development',
  email: {
    from: process.env.EMAIL_FROM!,
    smtp: {
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.NODE_ENV === 'production',
      user: process.env.SMTP_USER!,
      password: process.env.SMTP_PASSWORD!,
    },
  },
};
