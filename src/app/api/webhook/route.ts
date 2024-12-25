import { sendEmail } from '@/lib/email';
import { getAllWatchlists } from '@/lib/watchlist';
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'Client ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize WebSocket server if it doesn't exist
  if (!wss) {
    wss = new WebSocketServer({ port: Number(process.env.WS_PORT) || 3001 });

    wss.on('connection', (ws: WebSocket) => {
      // Handle incoming messages
      ws.on('message', (message) => {
        console.log('Received:', message.toString());

        // Optional: Broadcast to all clients
        clients.forEach((clientWs) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message.toString());
          }
        });
      });

      // Handle client disconnection
      ws.on('close', () => {
        // Find and remove the disconnected client
        clients.forEach((value, key) => {
          if (value === ws) {
            clients.delete(key);
          }
        });
      });
    });
  }

  // Add the new client to our map
  if (wss) {
    clients.set(
      clientId,
      new WebSocket(`ws://localhost:3001?clientId=${clientId}`)
    );

    wss.on('connection', (ws: WebSocket) => {
      clients.set(clientId, ws);
    });
  }

  return new Response(null, {
    status: 101,
    headers: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    },
  });
}

// Make sure the route is configured for WebSocket
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
