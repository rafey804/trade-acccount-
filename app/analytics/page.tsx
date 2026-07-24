'use client';

// =============================================================================
// PAGE 3: Weekly / Monthly Analytics
// Auto-aggregated stats from journal data
// =============================================================================

import { useEffect, useState } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import StatsCards from '@/components/analytics/StatsCards';
import PnLBarChart from '@/components/analytics/PnLBarChart';
import PnLHeatmap from '@/components/analytics/PnLHeatmap';
import DayOfWeekChart from '@/components/analytics/DayOfWeekChart';
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

  return (
    <PageTransition>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">
          Performance insights from your trading journal
        </p>
      </div>

      {/* Summary Stats */}
      <StatsCards data={data} loading={loading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <PnLBarChart data={data?.weeklyPnl || []} loading={loading} />
        <DayOfWeekChart data={data?.dayOfWeek || []} loading={loading} />
      </div>

      {/* Heatmap */}
      <div className="mt-4">
        <PnLHeatmap data={data?.dailyPnl || []} loading={loading} />
      </div>

      {/* Setup Performance Table */}
      {data && data.setupStats.length > 0 && (
        <div className="glass-card mt-4 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Setup Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Setup</th>
                  <th>Trades</th>
                  <th>Win Rate</th>
                  <th>Total PnL</th>
                  <th>Avg PnL</th>
                </tr>
              </thead>
              <tbody>
                {data.setupStats.map((setup) => (
                  <tr key={setup.setup}>
                    <td className="font-semibold text-[var(--foreground)]">{setup.setup}</td>
                    <td>{setup.trades}</td>
                    <td>
                      <span className={`badge text-xs ${
                        setup.winRate >= 50
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {setup.winRate}%
                      </span>
                    </td>
                    <td className={`font-mono text-sm font-semibold ${
                      setup.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ${setup.totalPnl.toFixed(2)}
                    </td>
                    <td className={`font-mono text-sm ${
                      setup.avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ${setup.avgPnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
