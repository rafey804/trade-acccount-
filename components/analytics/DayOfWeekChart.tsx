'use client';

// =============================================================================
// Day of Week Chart — Cyber-themed bar chart with gradient fills
// =============================================================================

import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import type { DayOfWeekStats } from '@/lib/types';

interface DayOfWeekChartProps {
  data: DayOfWeekStats[];
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
        {value >= 0 ? '+' : ''}${Number(value).toFixed(2)}
      </p>
      {entry && (
        <div className="flex gap-3 mt-1.5 pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
            {entry.trades} trades
          </span>
          <span className="text-[10px]" style={{ color: entry.winRate >= 50 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)' }}>
            {entry.winRate?.toFixed(0)}% win
          </span>
        </div>
      )}
    </div>
  );
}

export default function DayOfWeekChart({ data, loading }: DayOfWeekChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="cyber-card"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--cyber-amber-dim)' }}>
          <CalendarDays size={16} style={{ color: 'var(--cyber-amber)' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>PnL by Day of Week</h3>
          <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Average performance per day</p>
        </div>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--fg-3)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <p>No data yet</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dayBarGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="dayBarRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--fg-3)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.slice(0, 3)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--fg-3)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--cyber-cyan-dim)', opacity: 0.3 }} />
              <Bar
                dataKey="avgPnl"
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-in-out"
              >
                <LabelList
                  dataKey="trades"
                  position="top"
                  style={{ fontSize: 9, fill: 'var(--fg-3)', fontWeight: 700 }}
                  formatter={(v: any) => `${v}t`}
                />
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.avgPnl >= 0 ? 'url(#dayBarGreen)' : 'url(#dayBarRed)'}
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
