import { sendEmail } from '@/lib/email';
import { getAllWatchlists } from '@/lib/watchlist';
import { IncomingMessage } from 'http';
import { NextRequest, NextResponse } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;

// This map will store WebSocket connections for each client
const clients = new Map<string, WebSocket>();

export async function POST(request: NextRequest) {
  const responseData = await request.json();
  const data = responseData.data;

  // Broadcast the new transaction data to all connected clients
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  // Check if the transaction involves any watched accounts
  const allWatchlists = await getAllWatchlists();
  for (const watchlist of allWatchlists) {
    const watchedAddresses = watchlist.items.map((item) => item.address);
    if (
      watchedAddresses.includes(data.from) ||
      watchedAddresses.includes(data.to)
    ) {
      // Send email notification
      await sendEmail(watchlist.userId, data);
    }
  }

  return NextResponse.json({ success: true });
}

const handleUpgrade = (request: IncomingMessage) => {
  wss!.handleUpgrade(request, request.socket, Buffer.alloc(0), (ws) => {
    wss!.emit('connection', ws, request);
  });
};

export async function GET(request: Request | NextRequest) {
  const { href, searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'Client ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize WebSocket server if it doesn't exist
  if (!wss) {
    wss = new WebSocketServer({
      port: Number(process.env.WS_PORT) || 3001,
      verifyClient: (_, callback) => {
        // Allow connections from your frontend origin
        // const origin = info.origin || info.req.headers.origin;
        callback(true); // TODO: Update this
      },
    });
    console.log(
      `WebSocket server started on port ${process.env.WS_PORT || 3001}`
    );

    wss.on('listening', () => {
      console.log('WebSocket server is listening');
    });

    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    wss.on('connection', (ws: WebSocket) => {
      const interval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('message', (message) => {
        console.log('Received:', message.toString());

        clients.forEach((clientWs) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message.toString());
          }
        });
      });

      ws.on('close', () => {
        clients.forEach((value, key) => {
          if (value === ws) {
            clients.delete(key);
          }
        });
        clearInterval(interval);
      });
    });
  }

  if (wss) {
    clients.set(clientId, new WebSocket(href));

    wss.on('connection', (ws: WebSocket) => {
      clients.set(clientId, ws);
    });
  }

  if (request instanceof IncomingMessage) {
    handleUpgrade(request);
  }

  return new NextResponse(null, {
    status: 101,
    headers: {
      'Content-Type': 'text/plain',
      Connection: 'Upgrade',
      Upgrade: 'websocket',
    },
  });
}

// Websocket route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
