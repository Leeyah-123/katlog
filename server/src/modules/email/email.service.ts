import { SeaMailerClient } from 'seamailer-nodejs';
import { AppError } from '../../middlewares';
import logger from '../../utils/logger';
import { config } from '../../config';
import { AccountAction } from '../../core/types';

export class EmailService {
  private readonly seamailer: SeaMailerClient;

  constructor() {
    this.seamailer = new SeaMailerClient(config.email.seamailerApiKey);
  }

  async sendNotification(
    userId: string,
    email: string,
    transaction: AccountAction
  ) {
    try {
      await this.seamailer.sendMail({
        from: {
          email: config.email.from,
          name: 'Katlog',
        },
        to: [
          {
            email,
          },
        ],
        subject: 'Watchlist Account Transaction Alert',
        htmlPart: `
      <h1>Transaction Alert</h1>
      <p>A transaction involving an account on your watchlist has occurred:</p>
      <ul>
        <li>From: ${transaction.from}</li>
        <li>To: ${transaction.to}</li>
        <li>Action: ${transaction.action}</li>
        <li>Timestamp: ${new Date(transaction.timestamp).toLocaleString()}</li>
        <li>Signature: ${transaction.signature}</li>
      </ul>
    `,
      });
      console.log(`Email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending email notification', {
        error,
        userId,
        transaction,
      });
      throw new AppError(500, 'Failed to send email notification');
    }
  }
}
