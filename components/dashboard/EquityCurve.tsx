'use client';

// =============================================================================
// Equity Curve — CSS variable aware, dark + light
// =============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import type { TimePeriod, EquitySnapshot } from '@/lib/types';

interface Props { snapshots: EquitySnapshot[]; loading: boolean; }

const PERIODS: { label: string; value: TimePeriod }[] = [
  { label: '30D', value: '30d' },
  { label: '60D', value: '60d' },
  { label: '90D', value: '90d' },
];

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg)' }}>
        ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function EquityCurve({ snapshots, loading }: Props) {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const days = { '30d': 30, '60d': 60, '90d': 90 };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days[period]);

  const data = snapshots
    .filter(s => new Date(s.recordedAt) >= cutoff)
    .map(s => ({
      date:   new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      equity: s.totalEquity,
    }));

  const hasData  = data.length > 0;
  const positive = hasData && data[data.length - 1].equity >= data[0].equity;
  const lineCol  = positive ? 'var(--profit)' : 'var(--loss)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="card h-full"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="label">Equity Curve</p>
        <div className="flex gap-1" style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 3 }}>
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              style={{
                background: period === p.value ? 'var(--surface)'       : 'transparent',
                color:      period === p.value ? 'var(--fg)'            : 'var(--fg-3)',
                border:     period === p.value ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 260 }}>
        {loading ? (
          <div className="w-full h-full animate-shimmer rounded-xl" />
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-medium" style={{ color: 'var(--fg-3)' }}>No data yet</p>
            <p className="text-xs" style={{ color: 'var(--fg-3)', opacity: 0.6 }}>
              Connect Exness account to track equity
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={lineCol} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={lineCol} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--fg-3)', fontWeight: 600 }}
                tickLine={false} axisLine={false} dy={8}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--fg-3)', fontWeight: 600 }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `$${v.toLocaleString()}`}
                dx={-4}
              />
              <Tooltip content={<Tip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={lineCol}
                strokeWidth={2}
                fill="url(#grad)"
                dot={false}
                activeDot={{ r: 4, fill: lineCol, stroke: 'var(--surface)', strokeWidth: 2 }}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
