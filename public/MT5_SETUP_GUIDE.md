# MT5 EA Setup Guide — Exness Auto-Sync

## ✅ Step 1: Run Migration in Supabase

Before anything else, go to your **Supabase Dashboard** → **SQL Editor** and run this:

```sql
-- Create live_positions table
CREATE TABLE IF NOT EXISTS live_positions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket        BIGINT UNIQUE NOT NULL,
  symbol        VARCHAR(50) NOT NULL,
  direction     VARCHAR(10) NOT NULL CHECK (direction IN ('Long', 'Short')),
  volume        DECIMAL(10,2) NOT NULL,
  open_price    DECIMAL(20,5) NOT NULL,
  current_price DECIMAL(20,5) DEFAULT 0,
  floating_pnl  DECIMAL(20,4) DEFAULT 0,
  swap          DECIMAL(20,4) DEFAULT 0,
  open_time     TIMESTAMPTZ NOT NULL,
  last_updated  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_ticket ON live_positions(ticket);

ALTER TABLE live_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON live_positions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## ✅ Step 2: Set Your Secret Key in .env.local

In your project's `.env.local` file, add:

```
MT4_WEBHOOK_SECRET=my-secret-key-123
```

> Choose any secret — just remember it for Step 4!

---

## ✅ Step 3: Deploy to Vercel/Render

Push your code changes to GitHub. Vercel/Render will auto-deploy.

Also add `MT4_WEBHOOK_SECRET` to your Vercel/Render **Environment Variables**.

---

## ✅ Step 4: Copy EA to MT5

1. Open **MT5**
2. Click **File → Open Data Folder**
3. Go to: `MQL5 → Experts`
4. Copy **`TCC_Exness_AutoSync.mq5`** from your project's `public/` folder here
5. In MT5: Click **Refresh** in the Navigator panel
6. Compile the EA: right-click → **Compile** (or press F7)

---

## ✅ Step 5: Configure MT5 Permissions

1. Go to **Tools → Options → Expert Advisors** tab
2. Check: ✅ **Allow automated trading**
3. Check: ✅ **Allow WebRequest for listed URLs**
4. Add your dashboard URL: `https://your-dashboard.vercel.app`
5. Click **OK**

---

## ✅ Step 6: Attach EA to Chart

1. Open any chart in MT5 (e.g., **XAUUSD M1**)
2. Drag **TCC_Exness_AutoSync** from Navigator onto the chart
3. In the settings window:
   - **DashboardURL**: `https://your-dashboard.vercel.app` *(no trailing slash!)*
   - **WebhookSecret**: `my-secret-key-123` *(same as Step 2)*
   - **SyncInterval**: `5` (sync every 5 seconds)
4. Click **OK**
5. You'll see a **smiley face** on the chart — EA is running!

---

## ✅ Step 7: Test It

1. Open a trade on Exness
2. Go to your dashboard → you should see it in **Live Open Trades** within 5 seconds!
3. Close the trade → it disappears from Live and appears in **Exness History** + **Analytics**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "URL not whitelisted" in MT5 log | Re-check Step 5, make sure exact URL is added |
| EA shows sad face | Allow trading in MT5 Options |
| Live trades not showing | Check dashboard URL in EA settings (no trailing slash) |
| Secret error | Make sure secret in EA matches your .env.local |
