'use client';

// =============================================================================
// Allocation Chart — CSS variable aware
// =============================================================================

import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AllocationItem { symbol: string; value: number; percentage: number; side: 'Long' | 'Short'; }
interface Props { data: AllocationItem[]; loading: boolean; }

const COLORS = ['#E8B84B', '#22C55E', '#60A5FA', '#F87171', '#A78BFA', '#FB923C'];

export default function AllocationChart({ data, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="card"
    >
      <p className="label mb-5">Asset Allocation</p>

      {loading ? (
        <div className="h-36 animate-shimmer rounded-xl" />
      ) : data.length === 0 ? (
        <div className="h-36 flex items-center justify-center">
          <p className="text-sm font-medium" style={{ color: 'var(--fg-3)' }}>No open positions</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div style={{ width: 100, height: 100, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="percentage"
                  nameKey="symbol"
                  cx="50%" cy="50%"
                  innerRadius={32} outerRadius={46}
                  paddingAngle={4}
                  strokeWidth={0}
                  animationDuration={1200}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--fg)',
                  }}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Weight']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 5).map((item, i) => (
              <div key={item.symbol} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 font-medium truncate" style={{ color: 'var(--fg)' }}>
                  {item.symbol.replace('_USDT', '')}
                </span>
                <span className="font-semibold" style={{ color: item.side === 'Long' ? 'var(--profit)' : 'var(--loss)' }}>
                  {item.side}
                </span>
                <span className="font-mono" style={{ color: 'var(--fg-3)' }}>{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
