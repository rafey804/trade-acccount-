// =============================================================================
// API Route: /api/notes
// Full CRUD for trading notes
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('notes-read', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('notes-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: body.title.trim(),
        content: body.content.trim(),
        color: body.color || 'default',
        pinned: body.pinned || false,
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    console.error('Notes create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('notes-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        title: body.title?.trim(),
        content: body.content?.trim(),
        color: body.color,
        pinned: body.pinned,
        tags: body.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ note: data });
  } catch (error) {
    console.error('Notes update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('notes-write', RATE_LIMITS.journal);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notes delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete note' },
      { status: 500 }
    );
  }
}
