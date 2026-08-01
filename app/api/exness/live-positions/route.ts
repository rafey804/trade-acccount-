import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.MT4_WEBHOOK_SECRET || 'exness-dashboard-secret';

/**
 * POST /api/exness/live-positions
 * 
 * MT5 EA sends this every 5 seconds with ALL currently open positions.
 * We do a full upsert — positions that no longer exist are removed (trade closed).
 * 
 * Body:
 * {
 *   "secret": "your-secret",
 *   "positions": [
 *     {
 *       "ticket": 12345678,
 *       "symbol": "XAUUSD",
 *       "type": "buy",
 *       "volume": 0.01,
 *       "open_price": 1950.50,
 *       "current_price": 1955.00,
 *       "floating_pnl": 4.50,
 *       "swap": 0.00,
 *       "open_time": "2024-08-01 10:30:00"
 *     }
 *   ]
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const positions: any[] = body.positions || [];

    // Step 1: Upsert all current open positions
    if (positions.length > 0) {
      const rows = positions.map((p: any) => ({
        ticket: Number(p.ticket),
        symbol: String(p.symbol).toUpperCase(),
        direction: String(p.type).toLowerCase().includes('buy') ? 'Long' : 'Short',
        volume: parseFloat(p.volume) || 0,
        open_price: parseFloat(p.open_price) || 0,
        current_price: parseFloat(p.current_price) || 0,
        floating_pnl: parseFloat(p.floating_pnl) || 0,
        swap: parseFloat(p.swap) || 0,
        open_time: p.open_time,
        last_updated: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('live_positions')
        .upsert(rows, { onConflict: 'ticket' });

      if (error) {
        console.error('Upsert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Step 2: Remove positions that are no longer open (closed trades)
    // Get all tickets currently in DB
    const { data: dbPositions } = await supabase
      .from('live_positions')
      .select('ticket');

    const dbTickets = (dbPositions || []).map((p: any) => p.ticket);
    const activeTickets = positions.map((p: any) => Number(p.ticket));
    const closedTickets = dbTickets.filter((t: number) => !activeTickets.includes(t));

    if (closedTickets.length > 0) {
      await supabase
        .from('live_positions')
        .delete()
        .in('ticket', closedTickets);
    }

    return NextResponse.json({
      success: true,
      active: positions.length,
      closed: closedTickets.length,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/exness/live-positions
 * Dashboard fetches current open positions
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('live_positions')
      .select('*')
      .order('open_time', { ascending: false });

    if (error) throw error;

    // Calculate total floating PnL
    const totalFloating = (data || []).reduce((sum: number, p: any) => sum + (p.floating_pnl || 0), 0);

    return NextResponse.json({
      positions: data || [],
      totalFloating,
      count: (data || []).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/exness/live-positions
 * MT5 EA calls this when a position closes (optional, also handled by POST upsert)
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticket } = body;
    await supabase.from('live_positions').delete().eq('ticket', Number(ticket));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
