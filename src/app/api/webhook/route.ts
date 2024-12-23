import { sendEmail } from '@/lib/email';
import { getAllWatchlists } from '@/lib/watchlist';
import { NextRequest, NextResponse } from 'next/server';
import { WebSocket } from 'ws';

// let wss: WebSocket.Server;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wss: any;

// This map will store WebSocket connections for each client
const clients = new Map<string, WebSocket>();

export async function POST(request: NextRequest) {
  const data = await request.json();

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  if (!wss) {
    wss = new WebSocket.Server({ noServer: true });
  }

  const ws = await new Promise<WebSocket>((resolve) => {
    wss.handleUpgrade(
      request,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request as any).socket,
      Buffer.alloc(0),
      (ws: WebSocket) => {
        resolve(ws);
      }
    );
  });

  clients.set(clientId, ws);

  ws.on('close', () => {
    clients.delete(clientId);
  });

  return new Response(null, {
    status: 101,
    headers: {
      Upgrade: 'websocket',
    },
  });
}
