// =============================================================================
// API Route: /api/mexc/account
// Returns account balance, open positions, and PnL data from MEXC
// =============================================================================

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAccountAssets, getOpenPositions } from '@/lib/mexc-client';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

export async function GET() {
  // Auth check
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check
  const { allowed, retryAfter } = checkRateLimit('mexc-account', RATE_LIMITS.mexc);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const [assets, positions] = await Promise.all([
      getAccountAssets(),
      getOpenPositions(),
    ]);

    // Find the USDT asset (primary trading currency)
    const usdtAsset = assets?.find((a: { currency: string }) => a.currency === 'USDT') || {
      currency: 'USDT',
      availableBalance: 0,
      frozenBalance: 0,
      positionMargin: 0,
      equity: 0,
      unrealized: 0,
    };

    return NextResponse.json({
      account: {
        totalEquity: usdtAsset.equity,
        availableBalance: usdtAsset.availableBalance,
        marginUsed: usdtAsset.positionMargin,
        unrealizedPnl: usdtAsset.unrealized, // MEXC API uses 'unrealized' here
        currency: 'USDT',
      },
      positions: (positions || []).map((p: any) => ({
        ...p,
        unrealizedPnl: p.unRealizedPnl, // normalize casing
      })),
    });
  } catch (error) {
    console.error('MEXC account fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch account data' },
      { status: 500 }
    );
  }
}
