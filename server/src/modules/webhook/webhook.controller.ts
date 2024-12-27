import { Request, Response } from 'express';
import { AccountAction } from '../../core/types';
import { AppError } from '../../middlewares';
import logger from '../../utils/logger';
import { EmailService } from '../email/email.service';
import { UserService } from '../users/user.service';
import { WatchlistService } from '../watchlist/watchlist.service';
import { WebhookService } from './webhook.service';

export class WebhookController {
  private userService: UserService;
  private wsService: WebhookService;
  private watchlistService: WatchlistService;
  private emailService: EmailService;

  constructor() {
    this.userService = new UserService();
    this.wsService = new WebhookService();
    this.watchlistService = new WatchlistService();
    this.emailService = new EmailService();

    this.handleWebSocketUpgrade = this.handleWebSocketUpgrade.bind(this);
    this.handleTransactions = this.handleTransactions.bind(this);
  }

  async handleWebSocketUpgrade(req: Request, res: Response): Promise<void> {
    const clientId = req.query.clientId as string;

    if (!clientId) {
      throw new AppError(400, 'Client ID is required');
    }

    res.writeHead(101, {
      'Content-Type': 'text/plain',
      Connection: 'Upgrade',
      Upgrade: 'websocket',
    });
  }

  async handleTransactions(req: Request, res: Response): Promise<void> {
    try {
      const transactions: AccountAction[] = req.body.data;

      // Broadcast to WebSocket clients
      this.wsService.broadcastTransactions(transactions);

      for (const transaction of transactions) {
        // Check watchlists and send notifications
        const notifyUsers = await this.watchlistService.checkWatchedAddresses(
          transaction
        );

        // Send email notifications
        await Promise.all(
          notifyUsers.map(async ({ userId, account, accountLabel }) => {
            // Fetch user email from main server
            const user = await this.userService.getUserById(userId);

            return this.emailService.sendNotification({
              email: user.email,
              account,
              accountLabel,
              transaction,
            });
          })
        );
      }

      res.json({ success: true });
    } catch (error) {
      logger.error('Error handling transaction:', error);
      throw new AppError(500, 'Failed to process transaction');
    }
  }
}
