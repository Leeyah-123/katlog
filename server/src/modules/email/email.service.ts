import * as nodemailer from 'nodemailer';
import { config } from '../../config';
import { AccountAction } from '../../core/types';
import { AppError } from '../../middlewares';
import logger from '../../utils/logger';

export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });
  }

  async sendNotification(email: string, transaction: AccountAction) {
    try {
      await this.transporter.sendMail({
        from: `Katlog <${config.email.from}>`,
        to: email,
        subject: 'Watchlist Account Transaction Alert',
        html: `
          <h1>Transaction Alert</h1>
          <p>A transaction involving an account on your watchlist has occurred:</p>
          <ul>
            <li>Signature: ${transaction.signature}</li>
            <li>From: ${transaction.from}</li>
            <li>To: ${transaction.to}</li>
            <li>Amount: ${transaction.amount}</li>
            <li>Action: ${transaction.action}</li>
            <li>Timestamp: ${transaction.timestamp}</li>
            <li>Success: ${transaction.success}</li>
          </ul>
        `,
      });

      logger.info(`Transaction alert sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      throw new AppError(500, 'Failed to send email notification');
    }
  }
}
