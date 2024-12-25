import { WebSocketServer } from 'ws';
import { createServer } from 'http';

let wss: WebSocketServer | null = null;

export function getWSServer() {
  if (!wss) {
    const server = createServer();
    wss = new WebSocketServer({ server });
    server.listen(process.env.WS_PORT || 3001);
  }
  return wss;
}

export function closeWSServer() {
  if (wss) {
    wss.close();
    wss = null;
  }
}
