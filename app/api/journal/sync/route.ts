import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getHistoryOrders } from '@/lib/mexc-client';

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch history orders from MEXC
    // We fetch a larger limit to ensure we catch recent trades
    const history = await getHistoryOrders(undefined, 100);

    // 2. Filter for "Close Position" orders (openType === 2)
    const closeOrders = history.filter(order => order.openType === 2);

    if (closeOrders.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'No closed positions found.' });
    }

    const supabase = createServerSupabaseClient();
    let insertedCount = 0;

    // 3. Process and insert each order if it doesn't already exist
    for (const order of closeOrders) {
      // MEXC side for a Close order is the opposite of the position direction
      // If we are closing by Selling (side=2 or 4), the original position was Long.
      // If we are closing by Buying (side=1 or 3), the original position was Short.
      const isLong = order.side === 2 || order.side === 4;
      const direction = isLong ? 'Long' : 'Short';

      const tradeDate = new Date(order.createTime).toISOString();
      // MEXC profit is gross profit. We add fee * 2 to estimate the round-trip fee.
      const pnl = (order.profit || 0) + ((order.fee || 0) * 2);
      let result = 'Breakeven';
      if (pnl > 0) result = 'Win';
      if (pnl < 0) result = 'Loss';

      // Deduplication check: Do we already have this exact trade?
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('trade_date', tradeDate)
        .eq('symbol', order.symbol)
        .eq('position_size', order.dealVol)
        .eq('direction', direction)
        .maybeSingle();

      if (!existing) {
        // Insert new journal entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            trade_date: tradeDate,
            symbol: order.symbol,
            direction: direction,
            entry_price: order.dealAvgPrice, // Rough approximation if we don't fetch the open order
            exit_price: order.dealAvgPrice,
            position_size: order.dealVol,
            leverage: order.leverage,
            result: result,
            pnl: pnl,
            setup: 'Auto-Synced',
            reasoning: `Auto-synced from MEXC. Order ID: ${order.orderId}`,
          });

        if (error) {
          console.error('Error inserting auto-synced trade:', error);
        } else {
          insertedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      message: `Successfully synced ${insertedCount} new trades from MEXC.`,
    });
  } catch (error) {
    console.error('MEXC sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync from MEXC' },
      { status: 500 }
    );
  }
}
