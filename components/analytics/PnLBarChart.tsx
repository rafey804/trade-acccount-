'use client';

// =============================================================================
// PnL Bar Chart — Cyber-themed with gradient bars and glow effects
// =============================================================================

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { WeeklyPnl } from '@/lib/types';

interface PnLBarChartProps {
  data: WeeklyPnl[];
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const entry = payload[0]?.payload;
  return (
    <div className="cyber-tooltip">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-3)' }}>
        {label}
      </p>
      <p className="text-base font-black font-mono" style={{ color: value >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)' }}>
        {value >= 0 ? '+' : ''}${value.toFixed(2)}
      </p>
      {entry && (
        <div className="flex gap-3 mt-1.5 pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
            <b style={{ color: 'var(--cyber-emerald)' }}>{entry.wins}W</b> / <b style={{ color: 'var(--cyber-rose)' }}>{entry.losses}L</b>
          </span>
          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
            {entry.trades} trades
          </span>
        </div>
      )}
    </div>
  );
}

export default function PnLBarChart({ data, loading }: PnLBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="cyber-card"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--cyber-blue-dim)' }}>
          <BarChart3 size={16} style={{ color: 'var(--cyber-blue)' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Weekly Net PnL</h3>
          <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Performance by week</p>
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--fg-3)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p>Log trades to see weekly PnL</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="barGradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity={0.8} />
                </linearGradient>
                <filter id="barGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 10, fill: 'var(--fg-3)' }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--fg-3)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--cyber-cyan-dim)', opacity: 0.3 }} />
              <Bar
                dataKey="netPnl"
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-in-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.netPnl >= 0 ? 'url(#barGradientGreen)' : 'url(#barGradientRed)'}
                    style={{ filter: 'url(#barGlow)' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
