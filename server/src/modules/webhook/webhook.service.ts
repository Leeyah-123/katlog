import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import logger from '../../utils/logger';
import { WatchlistService } from '../watchlist/watchlist.service';

export class WebhookService {
  private wss: WebSocketServer | null = null;
  private static clients: Map<string, { ws: WebSocket; userId: string }> =
    new Map();
  private watchlistService: WatchlistService;

  constructor() {
    this.watchlistService = new WatchlistService();
  }

  initialize(server: Server): void {
    if (this.wss) return;

    // Create WebSocket server attached to HTTP server
    this.wss = new WebSocketServer({ server });

    this.setupServerListeners();
    logger.info('WebSocket server initialized');
  }

  private setupServerListeners(): void {
    if (!this.wss) return;

    this.wss.on('listening', () => {
      logger.info('WebSocket server is listening');
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const { clientId, userId } = this.extractClientIdAndUserIdFromUrl(
        request.url
      );

      if (clientId && userId) {
        this.handleConnection(ws, clientId, userId);
      } else {
        ws.close(1002, 'Client ID and User ID required');
      }
    });
  }

  private extractClientIdAndUserIdFromUrl(url: string): {
    clientId: string | null;
    userId: string | null;
  } {
    const params = new URLSearchParams(url.split('?')[1]);
    return {
      clientId: params.get('clientId'),
      userId: params.get('userId'),
    };
  }

  private handleConnection(
    ws: WebSocket,
    clientId: string,
    userId: string
  ): void {
    logger.info(`Client connected: ${clientId} for user: ${userId}`);
    WebhookService.clients.set(clientId, { ws, userId });

    const pingInterval = this.setupPingInterval(ws);

    ws.on('message', (message) => {
      this.handleMessage(message);
    });

    ws.on('close', () => {
      logger.info(`Client disconnected: ${clientId}`);
      this.handleClose(ws);
      clearInterval(pingInterval);
    });

    ws.on('pong', () => {
      logger.debug(`Received pong from client: ${clientId}`);
    });

    // Send initial connection success message
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
  }

  private setupPingInterval(ws: WebSocket): NodeJS.Timeout {
    return setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);
  }

  private handleMessage(message: any): void {
    logger.debug('Received message:', message.toString());
    this.broadcastTransactions(message.toString());
  }

  private handleClose(ws: WebSocket): void {
    WebhookService.clients.forEach((value, key) => {
      if (value.ws === ws) {
        WebhookService.clients.delete(key);
      }
    });
  }

  async broadcastTransactions(data: any): Promise<void> {
    const transactions = Array.isArray(data) ? data : [data];

    for (const [clientId, { ws, userId }] of WebhookService.clients.entries()) {
      if (ws.readyState !== WebSocket.OPEN) continue;

      // Get user's watchlist addresses
      const watchlist = await this.watchlistService.getWatchlistByUserId(
        userId
      );
      const watchedAddresses = new Set(
        watchlist.reduce((acc, item) => {
          item.items.forEach((i) => acc.add(i.address));
          return acc;
        }, new Set<string>())
      );

      // Filter transactions relevant to this user
      const relevantTransactions = transactions.filter(
        (tx) => watchedAddresses.has(tx.from) || watchedAddresses.has(tx.to)
      );

      if (relevantTransactions.length > 0) {
        ws.send(
          JSON.stringify({
            type: 'transactions',
            data: relevantTransactions,
          })
        );
      }
    }
  }

  getWSS(): WebSocketServer | null {
    return this.wss;
  }
}
