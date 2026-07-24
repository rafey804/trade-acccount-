// =============================================================================
// API Route: /api/mexc/symbols
// Returns available MEXC futures trading symbols
// =============================================================================

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getContractList } from '@/lib/mexc-client';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

// Cache symbols for 5 minutes (they rarely change)
let cachedSymbols: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('mexc-symbols', RATE_LIMITS.mexc);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    // Return cached if fresh
    if (cachedSymbols && Date.now() - cachedSymbols.timestamp < CACHE_DURATION) {
      return NextResponse.json({ symbols: cachedSymbols.data });
    }

    const contracts = await getContractList();
    const symbols = contracts
      .filter((c: { isOpenApi: boolean }) => c.isOpenApi)
      .map((c: { symbol: string; displayName: string; baseCoin: string; quoteCoin: string }) => ({
        symbol: c.symbol,
        displayName: c.displayName,
        baseCoin: c.baseCoin,
        quoteCoin: c.quoteCoin,
      }))
      .sort((a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol));

    cachedSymbols = { data: symbols, timestamp: Date.now() };
    return NextResponse.json({ symbols });
  } catch (error) {
    console.error('MEXC symbols fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch symbols' },
      { status: 500 }
    );
  }
}
