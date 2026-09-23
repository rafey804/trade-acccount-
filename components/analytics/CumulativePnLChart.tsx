'use client';

// =============================================================================
// Cumulative PnL Area Chart — Cyber-themed with gradient fill and glow
// =============================================================================

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WeeklyPnl } from '@/lib/types';

interface CumulativePnLChartProps {
  data: WeeklyPnl[];
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="cyber-tooltip">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-3)' }}>
        {label}
      </p>
      <p className="text-sm font-bold font-mono" style={{ color: value >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)' }}>
        {value >= 0 ? '+' : ''}${value.toFixed(2)}
      </p>
    </div>
  );
}

export default function CumulativePnLChart({ data, loading }: CumulativePnLChartProps) {
  // Transform weekly PnL into cumulative
  const cumulativeData = data.reduce<{ weekLabel: string; cumPnl: number }[]>((acc, week) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumPnl : 0;
    acc.push({ weekLabel: week.weekLabel, cumPnl: prev + week.netPnl });
    return acc;
  }, []);

  const lastValue = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumPnl : 0;
  const isPositive = lastValue >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--cyber-cyan-dim)' }}>
            <TrendingUp size={16} style={{ color: 'var(--cyber-cyan)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Equity Curve</h3>
            <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Cumulative PnL over time</p>
          </div>
        </div>
        {!loading && cumulativeData.length > 0 && (
          <span className="text-lg font-bold font-mono" style={{ color: isPositive ? 'var(--cyber-emerald)' : 'var(--cyber-rose)' }}>
            {isPositive ? '+' : ''}${lastValue.toFixed(2)}
          </span>
        )}
      </div>

      <div className="h-72">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : cumulativeData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--fg-3)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <p>Log trades to see your equity curve</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="cumPnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'var(--cyber-emerald)' : 'var(--cyber-rose)'} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={isPositive ? 'var(--cyber-emerald)' : 'var(--cyber-rose)'} stopOpacity={0.02} />
                </linearGradient>
                <filter id="glowLine">
                  <feGaussianBlur stdDeviation="3" result="blur" />
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke={isPositive ? 'var(--cyber-emerald)' : 'var(--cyber-rose)'}
                strokeWidth={2.5}
                fill="url(#cumPnlGradient)"
                filter="url(#glowLine)"
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
