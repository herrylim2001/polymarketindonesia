import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/api/middleware';

// Store for active connections (in production, use Redis pub/sub)
interface Connection {
  userId: string;
  controller: ReadableStreamDefaultController;
  lastPing: number;
}

const connections = new Map<string, Connection>();

// Cleanup stale connections every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [id, conn] of connections.entries()) {
    if (now - conn.lastPing > 60000) { // 60 seconds timeout
      try {
        conn.controller.close();
      } catch { /* ignore */ }
      connections.delete(id);
    }
  }
}, 30000);

/**
 * Broadcast message to all connected users
 */
export function broadcastToAll(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const conn of connections.values()) {
    try {
      conn.controller.enqueue(new TextEncoder().encode(message));
    } catch { /* connection closed */ }
  }
}

/**
 * Send message to specific user
 */
export function sendToUser(userId: string, event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const conn of connections.values()) {
    if (conn.userId === userId) {
      try {
        conn.controller.enqueue(new TextEncoder().encode(message));
      } catch { /* connection closed */ }
    }
  }
}

/**
 * Send market update to all users watching that market
 */
export function broadcastMarketUpdate(marketId: string, data: unknown) {
  broadcastToAll('market_update', { marketId, ...data });
}

// GET /api/realtime - SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  // Generate connection ID
  const connectionId = `${user?.id || 'anon'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(connectionId, {
        userId: user?.id || '',
        controller,
        lastPing: Date.now(),
      });

      // Send initial connection event
      const connectMsg = `event: connected\ndata: ${JSON.stringify({ connectionId, userId: user?.id })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMsg));

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          const conn = connections.get(connectionId);
          if (conn) {
            conn.lastPing = Date.now();
            controller.enqueue(new TextEncoder().encode(':heartbeat\n\n'));
          }
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // If authenticated, send initial data
      if (user) {
        sendInitialData(user.id, controller);
      }
    },

    cancel() {
      connections.delete(connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// POST /api/realtime - Trigger events (internal use)
export async function POST(request: NextRequest) {
  try {
    // Verify internal call (in production, use a secret header)
    const authHeader = request.headers.get('x-internal-key');
    if (authHeader !== process.env.INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { type, userId, data } = body;

    switch (type) {
      case 'broadcast':
        broadcastToAll(data.event, data.payload);
        break;

      case 'user':
        if (userId) {
          sendToUser(userId, data.event, data.payload);
        }
        break;

      case 'market':
        broadcastMarketUpdate(data.marketId, data.payload);
        break;

      default:
        return new Response('Invalid type', { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error triggering realtime event:', error);
    return new Response('Internal error', { status: 500 });
  }
}

/**
 * Send initial data when user connects
 */
async function sendInitialData(userId: string, controller: ReadableStreamDefaultController) {
  try {
    // Get unread notification count
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    // Get active bets count
    const activeBets = await prisma.bet.count({
      where: { userId, status: 'ACTIVE' },
    });

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    const initialData = {
      unreadNotifications: unreadCount,
      activeBets,
      balance: Number(user?.balance || 0),
    };

    const message = `event: initial_data\ndata: ${JSON.stringify(initialData)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}
