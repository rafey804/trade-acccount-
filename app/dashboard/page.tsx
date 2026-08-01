'use client';

// =============================================================================
// Dashboard — Clean professional overview
// No fake data, real journal stats only, dark+light mode
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import BalanceCards from '@/components/dashboard/BalanceCards';
import PnLCards from '@/components/dashboard/PnLCards';
import EquityCurve from '@/components/dashboard/EquityCurve';
import WinRateCard from '@/components/dashboard/WinRateCard';
import AllocationChart from '@/components/dashboard/AllocationChart';
import RiskCalculator from '@/components/dashboard/RiskCalculator';
import MarketNews from '@/components/dashboard/MarketNews';
import EconomicCalendar from '@/components/dashboard/EconomicCalendar';
import SessionClocks from '@/components/dashboard/SessionClocks';
import MiniChart from '@/components/dashboard/MiniChart';
import HabitTracker from '@/components/dashboard/HabitTracker';
import QuickLogTrade from '@/components/dashboard/QuickLogTrade';
import DisciplineInstruments from '@/components/dashboard/DisciplineInstruments';
import LiveTrades from '@/components/dashboard/LiveTrades';
import type { EquitySnapshot } from '@/lib/types';

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function DashboardPage() {
  const [winRate, setWinRate]           = useState(0);
  const [totalTrades, setTotalTrades]   = useState(0);
  const [realizedToday, setToday]       = useState(0);
  const [realizedWeek, setWeek]         = useState(0);
  const [realizedMonth, setMonth]       = useState(0);
  const [snapshots]                     = useState<EquitySnapshot[]>([]);
  const [loading, setLoading]           = useState(true);

  // Live MT5 Data
  const [accountMetrics, setAccountMetrics] = useState<any>(null);
  const [livePnl, setLivePnl]               = useState(0);

  // We can still keep the current PKT date for the top right date display if needed
  const [dateStr, setDateStr] = useState('Loading...');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const d = await res.json();
        setWinRate(d.overallWinRate  || 0);
        setTotalTrades(d.totalTrades || 0);
        setToday(d.realizedToday     || 0);
        setWeek(d.realizedWeek       || 0);
        setMonth(d.realizedMonth     || 0);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/exness/live-positions');
      if (res.ok) {
        const d = await res.json();
        
        let overview = null;
        if (d.accountMetrics) {
          overview = {
            totalEquity: d.accountMetrics.equity,
            availableBalance: d.accountMetrics.balance,
            marginUsed: d.accountMetrics.margin_used,
            unrealizedPnl: d.totalFloating,
            currency: 'USD',
          };
        }
        
        setAccountMetrics(overview);
        setLivePnl(d.totalFloating || 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLive();
    const iv1 = setInterval(fetchStats, 30_000);
    const iv2 = setInterval(fetchLive, 5_000);
    return () => {
      clearInterval(iv1);
      clearInterval(iv2);
    };
  }, [fetchStats, fetchLive]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div {...up(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>{dateStr}</p>
          </div>
        </motion.div>

        {/* ── World Clocks ──────────────────────────────────────── */}
        <motion.div {...up(0.02)}>
          <SessionClocks />
        </motion.div>

        {/* ── Exness Status Banner ─────────────────────────────── */}
        <motion.div {...up(0.04)}>
          <div
            className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>BROKER</p>
              <p className="text-base font-bold mt-0.5" style={{ color: 'var(--fg)' }}>Exness</p>
              <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
                {accountMetrics ? 'Live connection active' : 'Account not connected — deposit $100 next week to go live'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--surface)', color: 'var(--fg-2)', border: '1px solid var(--border)' }}
              >
                BTC/USD
              </span>
              <span
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--surface)', color: 'var(--fg-2)', border: '1px solid var(--border)' }}
              >
                XAU/USD
              </span>
              <RiskCalculator />
              <QuickLogTrade />
              <a
                href="https://www.exness.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-[12px] py-1.5 px-4"
              >
                Open Exness ↗
              </a>
            </div>
          </div>
        </motion.div>

        {/* ── Balance Cards ────────────────────────────────────── */}
        <BalanceCards data={accountMetrics} loading={loading && !accountMetrics} />

        {/* ── PnL Cards ────────────────────────────────────────── */}
        <PnLCards
          unrealizedPnl={livePnl}
          realizedToday={realizedToday}
          realizedWeek={realizedWeek}
          realizedMonth={realizedMonth}
          loading={loading && !accountMetrics}
        />

        {/* ── Charts ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <EquityCurve snapshots={snapshots} loading={loading} />
          </div>
          <div className="space-y-5">
            <WinRateCard winRate={winRate} totalTrades={totalTrades} loading={loading} />
            <AllocationChart data={[]} loading={loading} />
          </div>
        </div>

        {/* ── Live Trades ───────────────────────────────────────────── */}
        <motion.div {...up(0.15)}>
          <LiveTrades />
        </motion.div>

        {/* ── Market Data ───────────────────────────── */}
        <motion.div {...up(0.2)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MiniChart />
            <MarketNews />
            <EconomicCalendar />
          </div>
        </motion.div>

      {/* ── Discipline & Risk ─────────────────────────────────── */}
        <motion.div {...up(0.25)}>
          <DisciplineInstruments />
        </motion.div>

        {/* ── Habits & Rules ────────────────────────────────────── */}
        <motion.div {...up(0.35)}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-1">
              <HabitTracker />
            </div>
            <div className="card xl:col-span-2">
              <p className="label mb-4">Your Rules</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Only XAU/USD (Gold) & BTC/USD — no altcoins',
                  'Max 2 trades per session (London 12–5 PM, NY 6–11 PM PKT)',
                  'Risk max 2% per trade ($2 on $100 account)',
                  '2-hour cooldown after any loss — no revenge trading',
                  'Daily loss limit $5 — hit it, close the platform',
                  'Only trade when setup clearly confirms entry',
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--fg-2)' }}>{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </PageTransition>
  );
}
