import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple secret key to prevent unauthorized pushes
// Set MT4_WEBHOOK_SECRET in your .env.local file
const WEBHOOK_SECRET = process.env.MT4_WEBHOOK_SECRET || 'exness-dashboard-secret';

/**
 * MT4/MT5 Expert Advisor sends a POST request here after every trade closes.
 * 
 * Expected JSON body:
 * {
 *   "secret": "your-secret-key",
 *   "ticket": 12345678,
 *   "symbol": "XAUUSD",
 *   "type": "buy",          // "buy" or "sell"
 *   "volume": 0.01,
 *   "open_price": 1950.50,
 *   "close_price": 1955.00,
 *   "open_time": "2024-08-01 10:30:00",
 *   "close_time": "2024-08-01 14:45:00",
 *   "profit": 4.50,
 *   "commission": -0.10,
 *   "swap": 0.00,
 *   "comment": "TP hit"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify secret
    if (body.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      ticket,
      symbol,
      type,
      volume,
      open_price,
      close_price,
      open_time,
      close_time,
      profit,
      commission = 0,
      swap = 0,
      comment = '',
    } = body;

    if (!ticket || !symbol) {
      return NextResponse.json({ error: 'Missing required fields: ticket, symbol' }, { status: 400 });
    }

    // Deduplication: check if this ticket already exists
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .ilike('reasoning', `%Ticket#${ticket}%`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        skipped: true, 
        message: `Trade ticket #${ticket} already exists.` 
      });
    }

    const netPnl = (parseFloat(profit) || 0) + (parseFloat(commission) || 0) + (parseFloat(swap) || 0);
    let result = 'Breakeven';
    if (netPnl > 0.01) result = 'Win';
    if (netPnl < -0.01) result = 'Loss';

    const direction = type?.toLowerCase().includes('buy') ? 'Long' : 'Short';

    const { error } = await supabase
      .from('journal_entries')
      .insert({
        trade_date: close_time || open_time,
        symbol: symbol.replace('/', '').toUpperCase(),
        direction,
        entry_price: parseFloat(open_price) || 0,
        exit_price: parseFloat(close_price) || 0,
        position_size: parseFloat(volume) || 0,
        result,
        pnl: netPnl,
        setup: 'Exness-MT4',
        reasoning: `Auto-synced via MT4 EA. Ticket#${ticket}. ${comment}`.trim(),
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Trade ${symbol} ${direction} (${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}) synced successfully.`,
    });

  } catch (err: any) {
    console.error('MT4 webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'MT4 Webhook active', 
    endpoint: '/api/exness/mt4-webhook',
    usage: 'POST with { secret, ticket, symbol, type, volume, open_price, close_price, open_time, close_time, profit }'
  });
}
