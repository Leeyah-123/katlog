import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import logger from '../../utils/logger';

export class WebhookService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();

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
      const clientId = this.getClientIdFromUrl(request.url);
      if (clientId) {
        this.handleConnection(ws, clientId);
      } else {
        ws.close(1002, 'Client ID required');
      }
    });
  }

  private getClientIdFromUrl(url: string): string | null {
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('clientId');
  }

  private handleConnection(ws: WebSocket, clientId: string): void {
    logger.info(`Client connected: ${clientId}`);
    this.clients.set(clientId, ws);
    console.log('HANDLE CONNECTION', Array.from(this.clients.keys()));

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
    this.broadcast(message.toString());
  }

  private handleClose(ws: WebSocket): void {
    this.clients.forEach((value, key) => {
      if (value === ws) {
        this.clients.delete(key);
      }
    });
  }

  broadcast(data: any): void {
    // Obtain all client keys
    console.log('Broadcast: Keys', Array.from(this.clients.keys()));

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        logger.info('Broadcasting message:', data);
        ws.send(
          JSON.stringify({
            type: 'transaction',
            data,
          })
        );
      }
    });
  }

  getWSS(): WebSocketServer | null {
    return this.wss;
  }
}
