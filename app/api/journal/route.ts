import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const symbol = searchParams.get('symbol') || '';
    const result = searchParams.get('result') || '';
    const setup = searchParams.get('setup') || '';
    const excludeAutoSynced = searchParams.get('excludeAutoSynced') === 'true';

    let query = supabase
      .from('journal_entries')
      .select('*')
      .order('trade_date', { ascending: false });

    if (search) {
      query = query.or(`symbol.ilike.%${search}%,reasoning.ilike.%${search}%`);
    }
    if (symbol) query = query.eq('symbol', symbol);
    if (result) query = query.eq('result', result);
    if (setup) query = query.eq('setup', setup);
    if (excludeAutoSynced) {
      query = query.not('setup', 'eq', 'Auto-Synced').not('setup', 'eq', 'Exness-Import');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (data.id) {
      // UPDATE
      const { error } = await supabase
        .from('journal_entries')
        .update({
          trade_date: data.trade_date,
          symbol: data.symbol,
          direction: data.direction,
          entry_price: data.entry_price,
          exit_price: data.exit_price,
          position_size: data.position_size,
          leverage: data.leverage,
          result: data.result,
          pnl: data.pnl,
          setup: data.setup,
          reasoning: data.reasoning,
          before_screenshot_url: data.before_screenshot_url,
          after_screenshot_url: data.after_screenshot_url,
        })
        .eq('id', data.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // INSERT
    const { error } = await supabase
      .from('journal_entries')
      .insert([{
        trade_date: data.trade_date,
        symbol: data.symbol,
        direction: data.direction,
        entry_price: data.entry_price,
        exit_price: data.exit_price,
        position_size: data.position_size,
        leverage: data.leverage,
        result: data.result,
        pnl: data.pnl,
        setup: data.setup,
        reasoning: data.reasoning,
        before_screenshot_url: data.before_screenshot_url,
        after_screenshot_url: data.after_screenshot_url,
      }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
