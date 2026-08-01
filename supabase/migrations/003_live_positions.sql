-- =============================================================================
-- Migration: Live Positions Table
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Live positions: stores currently open trades from MT5
-- This table is updated every few seconds by the MT5 EA
-- When a trade closes, it gets removed from here and added to journal_entries

CREATE TABLE IF NOT EXISTS live_positions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket        BIGINT UNIQUE NOT NULL,        -- MT5 position ticket (unique per trade)
  symbol        VARCHAR(50) NOT NULL,
  direction     VARCHAR(10) NOT NULL CHECK (direction IN ('Long', 'Short')),
  volume        DECIMAL(10,2) NOT NULL,
  open_price    DECIMAL(20,5) NOT NULL,
  current_price DECIMAL(20,5) DEFAULT 0,
  floating_pnl  DECIMAL(20,4) DEFAULT 0,       -- Current unrealized PnL
  swap          DECIMAL(20,4) DEFAULT 0,
  open_time     TIMESTAMPTZ NOT NULL,
  last_updated  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_live_ticket ON live_positions(ticket);
CREATE INDEX IF NOT EXISTS idx_live_symbol ON live_positions(symbol);

-- Disable RLS (using service role key)
ALTER TABLE live_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON live_positions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
