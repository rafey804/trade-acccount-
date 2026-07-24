'use client';

// =============================================================================
// Day of Week Chart — Bar chart showing PnL by day of week
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
} from 'recharts';
import type { DayOfWeekStats } from '@/lib/types';

interface DayOfWeekChartProps {
  data: DayOfWeekStats[];
  loading: boolean;
}

export default function DayOfWeekChart({ data, loading }: DayOfWeekChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={16} className="text-[var(--accent-blue)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">PnL by Day of Week</h3>
      </div>

      <div className="h-56">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-[var(--muted-fg)]">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--muted-fg)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.slice(0, 3)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-fg)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value) => {
                  const v = Number(value);
                  if (isNaN(v)) return ['—', ''];
                  return [`$${v.toFixed(2)}`, 'Avg PnL'];
                }}
              />
              <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.avgPnl >= 0 ? '#10B981' : '#EF4444'}
                    fillOpacity={0.85}
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
