-- Create account_metrics table to store the live equity, balance, and margin from MT5 EA

CREATE TABLE IF NOT EXISTS account_metrics (
  id integer PRIMARY KEY DEFAULT 1, -- Only one row for the single account dashboard
  balance numeric NOT NULL DEFAULT 0,
  equity numeric NOT NULL DEFAULT 0,
  margin_free numeric NOT NULL DEFAULT 0,
  margin_used numeric NOT NULL DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Ensure there is a row to upsert into later
INSERT INTO account_metrics (id, balance, equity, margin_free, margin_used)
VALUES (1, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;
