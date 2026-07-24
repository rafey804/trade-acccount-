// =============================================================================
// API Route: /api/mexc/orders
// GET: Fetch open orders | DELETE: Cancel an order
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOpenOrders, cancelOrder } from '@/lib/mexc-client';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('mexc-orders', RATE_LIMITS.mexc);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const orders = await getOpenOrders();
    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('MEXC orders fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('mexc-cancel', RATE_LIMITS.mexc);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const { symbol, orderId } = await request.json();
    if (!symbol || !orderId) {
      return NextResponse.json({ error: 'symbol and orderId are required' }, { status: 400 });
    }

    await cancelOrder(symbol, orderId);
    return NextResponse.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    console.error('MEXC cancel order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
