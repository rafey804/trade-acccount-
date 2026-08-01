-- =============================================================================
-- Trader Command Center — Notes Table Migration
-- Run this SQL in your Supabase project's SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'default',
  pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned DESC);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);
