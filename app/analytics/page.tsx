'use client';

// =============================================================================
// PAGE: Analytics — Cyber-Futuristic Trading Terminal
// Complete redesign with neon accents, glassmorphism, animated gradients
// =============================================================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import StatsCards from '@/components/analytics/StatsCards';
import PnLBarChart from '@/components/analytics/PnLBarChart';
import PnLHeatmap from '@/components/analytics/PnLHeatmap';
import DayOfWeekChart from '@/components/analytics/DayOfWeekChart';
import CumulativePnLChart from '@/components/analytics/CumulativePnLChart';
import WinLossRing from '@/components/analytics/WinLossRing';
import type { AnalyticsData } from '@/lib/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Compute wins/losses/breakeven from setupStats or dayOfWeek
  const totalWins = data?.setupStats?.reduce((sum, s) => sum + (s.wins || 0), 0) || 0;
  const totalTrades = data?.totalTrades || 0;
  const totalLosses = totalTrades - totalWins;
  const breakeven = 0; // Approximation since breakeven isn't tracked separately in analytics

  return (
    <PageTransition>
      <div className="cyber-grid-bg">
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--cyber-cyan-dim)', boxShadow: '0 0 20px var(--cyber-cyan-dim)' }}>
              <Activity size={20} style={{ color: 'var(--cyber-cyan)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-text-cyber">
                Analytics
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Zap size={10} style={{ color: 'var(--cyber-cyan)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--fg-3)' }}>
                  Performance insights from your trading journal
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Hero Stats ─────────────────────────────────────────────────── */}
        <StatsCards data={data} loading={loading} />

        {/* ─── Equity Curve + Win/Loss Ring ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
          <div className="lg:col-span-2">
            <CumulativePnLChart data={data?.weeklyPnl || []} loading={loading} />
          </div>
          <WinLossRing
            wins={totalWins}
            losses={totalLosses > 0 ? totalLosses : 0}
            breakeven={breakeven}
            winRate={data?.overallWinRate || 0}
            loading={loading}
          />
        </div>

        {/* ─── Charts Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          <PnLBarChart data={data?.weeklyPnl || []} loading={loading} />
          <DayOfWeekChart data={data?.dayOfWeek || []} loading={loading} />
        </div>

        {/* ─── Heatmap ────────────────────────────────────────────────────── */}
        <div className="mt-5">
          <PnLHeatmap data={data?.dailyPnl || []} loading={loading} />
        </div>

        {/* ─── Setup Performance Table ────────────────────────────────────── */}
        {data && data.setupStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="cyber-card mt-5 !p-0 overflow-hidden"
          >
            <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--cyber-magenta-dim)' }}>
                <Zap size={16} style={{ color: 'var(--cyber-magenta)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Setup Performance</h3>
                <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Win rate and PnL by strategy</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Setup', 'Trades', 'Win Rate', 'Total PnL', 'Avg PnL'].map(col => (
                      <th key={col} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)', borderBottom: '1px solid var(--border)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.setupStats.map((setup, i) => (
                    <motion.tr
                      key={setup.setup}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-3.5 font-bold text-sm" style={{ color: 'var(--fg)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{
                            background: setup.totalPnl >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
                            boxShadow: `0 0 6px ${setup.totalPnl >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(244,63,94,0.5)'}`,
                          }} />
                          {setup.setup}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono" style={{ color: 'var(--fg-2)' }}>
                        {setup.trades}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{
                            background: setup.winRate >= 50 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                            color: setup.winRate >= 50 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
                            border: `1px solid ${setup.winRate >= 50 ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                          }}
                        >
                          {setup.winRate}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-bold" style={{
                        color: setup.totalPnl >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
                      }}>
                        {setup.totalPnl >= 0 ? '+' : ''}${setup.totalPnl.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm" style={{
                        color: setup.avgPnl >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
                      }}>
                        {setup.avgPnl >= 0 ? '+' : ''}${setup.avgPnl.toFixed(2)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
