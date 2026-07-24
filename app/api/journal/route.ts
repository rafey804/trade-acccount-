// =============================================================================
// API Route: /api/journal
// Full CRUD for trading journal entries
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('journal-read', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabase.from('journal_entries').select('*');

    // Filters
    const symbol = searchParams.get('symbol');
    const result = searchParams.get('result');
    const setup = searchParams.get('setup');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'trade_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (symbol) query = query.eq('symbol', symbol);
    if (result) query = query.eq('result', result);
    if (setup) query = query.eq('setup', setup);
    if (dateFrom) query = query.gte('trade_date', dateFrom);
    if (dateTo) query = query.lte('trade_date', dateTo);
    if (searchParams.get('excludeAutoSynced') === 'true') {
      query = query.neq('setup', 'Auto-Synced');
    }
    if (search) {
      query = query.or(`symbol.ilike.%${search}%,reasoning.ilike.%${search}%,mistake.ilike.%${search}%,lesson.ilike.%${search}%`);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('journal-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        trade_date: body.trade_date,
        symbol: body.symbol,
        direction: body.direction,
        entry_price: body.entry_price,
        exit_price: body.exit_price || null,
        position_size: body.position_size,
        leverage: body.leverage || 1,
        result: body.result || null,
        pnl: body.pnl || null,
        setup: body.setup || null,
        reasoning: body.reasoning || null,
        mistake: body.mistake || null,
        lesson: body.lesson || null,
        emotion_rating: body.emotion_rating || null,
        before_screenshot_url: body.before_screenshot_url || null,
        after_screenshot_url: body.after_screenshot_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error('Journal create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('journal-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        trade_date: body.trade_date,
        symbol: body.symbol,
        direction: body.direction,
        entry_price: body.entry_price,
        exit_price: body.exit_price || null,
        position_size: body.position_size,
        leverage: body.leverage || 1,
        result: body.result || null,
        pnl: body.pnl || null,
        setup: body.setup || null,
        reasoning: body.reasoning || null,
        mistake: body.mistake || null,
        lesson: body.lesson || null,
        emotion_rating: body.emotion_rating || null,
        before_screenshot_url: body.before_screenshot_url || null,
        after_screenshot_url: body.after_screenshot_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error('Journal update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('journal-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Journal delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
