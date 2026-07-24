-- =============================================================================
-- Trader Command Center — Supabase Database Schema
-- Run this SQL in your Supabase project's SQL Editor
-- =============================================================================

-- Journal entries table: stores each trade log
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  trade_date TIMESTAMPTZ NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('Long', 'Short')),
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  position_size DECIMAL(20,8) NOT NULL,
  leverage INT DEFAULT 1,
  result VARCHAR(15) CHECK (result IN ('Win', 'Loss', 'Breakeven')),
  pnl DECIMAL(20,4),
  setup VARCHAR(50),
  reasoning TEXT,
  mistake TEXT,
  lesson TEXT,
  emotion_rating INT CHECK (emotion_rating BETWEEN 1 AND 5),
  before_screenshot_url TEXT,
  after_screenshot_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equity snapshots: periodic balance records for the equity curve chart
CREATE TABLE IF NOT EXISTS equity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  total_equity DECIMAL(20,4) NOT NULL,
  available_balance DECIMAL(20,4),
  unrealized_pnl DECIMAL(20,4)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_journal_trade_date ON journal_entries(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_symbol ON journal_entries(symbol);
CREATE INDEX IF NOT EXISTS idx_journal_result ON journal_entries(result);
CREATE INDEX IF NOT EXISTS idx_journal_setup ON journal_entries(setup);
CREATE INDEX IF NOT EXISTS idx_equity_recorded ON equity_snapshots(recorded_at DESC);

-- =============================================================================
-- Storage Bucket Setup (run these after creating the bucket in the UI):
--
-- 1. Go to Supabase Dashboard → Storage → Create bucket: "trade-screenshots"
-- 2. Set it to "Public" (so images can be viewed without auth)
-- 3. Add a policy:
--    - Name: "Allow authenticated uploads"
--    - Operation: INSERT
--    - Target role: service_role
--    - Policy: true (service role key is used server-side)
-- =============================================================================

-- Row Level Security (disabled for single-user app using service role key)
-- If you want RLS, enable it and create appropriate policies.
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (this is the default)
CREATE POLICY "Service role full access on journal" ON journal_entries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on equity" ON equity_snapshots
  FOR ALL USING (true) WITH CHECK (true);
