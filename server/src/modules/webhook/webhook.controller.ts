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
    this.handleTransaction = this.handleTransaction.bind(this);
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

  async handleTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transaction: AccountAction = req.body.data;
      logger.info('Received transaction:', transaction);

      // Broadcast to WebSocket clients
      this.wsService.broadcast(transaction);

      // Check watchlists and send notifications
      const notifyUserIds = await this.watchlistService.checkWatchedAddresses(
        transaction,
        req.token!!
      );

      // Send email notifications
      await Promise.all(
        notifyUserIds.map(async (userId) => {
          // Fetch user email from main server
          const user = await this.userService.getUserById(userId, req.token!!);

          return this.emailService.sendNotification(
            userId,
            user.email,
            transaction
          );
        })
      );

      res.json({ success: true });
    } catch (error) {
      logger.error('Error handling transaction:', error);
      throw new AppError(500, 'Failed to process transaction');
    }
  }
}
