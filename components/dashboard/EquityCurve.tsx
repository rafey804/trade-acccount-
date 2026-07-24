'use client';

// =============================================================================
// Equity Curve — Line chart with period selector
// =============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { TimePeriod, EquitySnapshot } from '@/lib/types';

interface EquityCurveProps {
  snapshots: EquitySnapshot[];
  loading: boolean;
}

const periods: { label: string; value: TimePeriod }[] = [
  { label: '30D', value: '30d' },
  { label: '60D', value: '60d' },
  { label: '90D', value: '90d' },
];

export default function EquityCurve({ snapshots, loading }: EquityCurveProps) {
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const daysMap = { '30d': 30, '60d': 60, '90d': 90 };
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysMap[period]);

  const filteredData = snapshots
    .filter(s => new Date(s.recordedAt) >= cutoff)
    .map(s => ({
      date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      equity: s.totalEquity,
    }));

  const hasData = filteredData.length > 0;
  const isPositive = hasData && filteredData[filteredData.length - 1].equity >= filteredData[0].equity;

  // Colors matching our Cyberpunk theme
  const strokeColor = isPositive ? '#00E676' : '#FF3B30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-[0.15em]">Equity Curve</h3>
        </div>
        <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1 shadow-inner">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer uppercase tracking-wider
                ${period === p.value
                  ? 'bg-[var(--accent-primary)] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] relative z-10">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-fg)] opacity-60">
             <TrendingUp size={32} className="mb-2 opacity-50" />
             <span className="text-xs uppercase tracking-widest font-semibold">Awaiting Data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--muted-fg)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-fg)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  color: 'white'
                }}
                itemStyle={{ color: strokeColor }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={strokeColor}
                strokeWidth={3}
                fill="url(#equityGradient)"
                filter="url(#glow)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
