import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Exness CSV Format columns (Trade History export):
 * Order, Open Time, Type, Volume, Symbol, Price, S/L, T/P, Close Time, Price, Commission, Swap, Profit
 * 
 * This endpoint accepts a JSON array of parsed CSV rows and inserts them.
 */
export async function POST(req: Request) {
  try {
    const { trades } = await req.json();

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json({ error: 'No trades provided' }, { status: 400 });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const trade of trades) {
      try {
        // Deduplication: check by order ID stored in reasoning field
        const { data: existing } = await supabase
          .from('journal_entries')
          .select('id')
          .ilike('reasoning', `%Order#${trade.orderId}%`)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          continue;
        }

        const pnl = parseFloat(trade.profit) || 0;
        let result = 'Breakeven';
        if (pnl > 0.01) result = 'Win';
        if (pnl < -0.01) result = 'Loss';

        const direction = trade.type?.toLowerCase().includes('buy') ? 'Long' : 'Short';

        const { error } = await supabase
          .from('journal_entries')
          .insert({
            trade_date: trade.closeTime || trade.openTime,
            symbol: trade.symbol?.replace('/', '').replace('-', '') || 'UNKNOWN',
            direction,
            entry_price: parseFloat(trade.openPrice) || 0,
            exit_price: parseFloat(trade.closePrice) || 0,
            position_size: parseFloat(trade.volume) || 0,
            result,
            pnl: pnl + (parseFloat(trade.commission) || 0) + (parseFloat(trade.swap) || 0),
            setup: 'Exness-Import',
            reasoning: `Imported from Exness. Order#${trade.orderId}`,
          });

        if (error) {
          errors.push(`Order ${trade.orderId}: ${error.message}`);
        } else {
          insertedCount++;
        }
      } catch (e: any) {
        errors.push(`Parse error: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      skipped: skippedCount,
      errors,
      message: `Inserted ${insertedCount} new trades. Skipped ${skippedCount} duplicates.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET: Fetch Exness-imported trades
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .ilike('setup', 'Exness-Import')
      .order('trade_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ trades: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
