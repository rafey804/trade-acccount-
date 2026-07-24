'use client';

// =============================================================================
// PnL Bar Chart — Weekly net PnL
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

export default function PnLBarChart({ data, loading }: PnLBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-[var(--accent-blue)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Weekly Net PnL</h3>
      </div>

      <div className="h-72">
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-[var(--muted-fg)]">
            No data yet. Log trades in the journal to see weekly PnL.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 10, fill: 'var(--muted-fg)' }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Net PnL']}
                labelFormatter={(label) => `Week: ${label}`}
              />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.netPnl >= 0 ? '#10B981' : '#EF4444'}
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
