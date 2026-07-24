// =============================================================================
// Trader Command Center — Supabase Browser Client
// =============================================================================
// For use in Client Components (browser-side).
// Uses the anon key — only for public operations.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export function createBrowserSupabaseClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    );
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
