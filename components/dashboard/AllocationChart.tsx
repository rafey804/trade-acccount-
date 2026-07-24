'use client';

// =============================================================================
// Allocation Chart — Donut chart of held assets
// =============================================================================

import { motion } from 'framer-motion';
import { PieChart as PieIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AllocationItem {
  symbol: string;
  value: number;
  percentage: number;
  side: 'Long' | 'Short';
}

interface AllocationChartProps {
  data: AllocationItem[];
  loading: boolean;
}

// Cyberpunk Neon Palette
const COLORS = [
  '#00F0FF', // Electric Cyan
  '#B026FF', // Neon Purple
  '#00E676', // Emerald Glow
  '#FF3B30', // Crimson Glow
  '#F59E0B', // Amber
  '#E81CFF', // Magenta
  '#3B82F6', // Blue
];

export default function AllocationChart({ data, loading }: AllocationChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden group"
    >
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <PieIcon size={18} className="text-[var(--accent-secondary)] drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" />
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-[0.15em]">Asset Allocation</h3>
      </div>

      {loading ? (
        <div className="h-48 w-full rounded-lg animate-shimmer relative z-10" />
      ) : data.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-[var(--muted-fg)] opacity-60 relative z-10">
          <Activity size={32} className="mb-2 opacity-50" />
          <span className="text-xs uppercase tracking-widest font-semibold">No Assets</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full relative z-10">
          <div className="w-32 h-32 sm:w-44 sm:h-44 shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="percentage"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={2}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((_, index) => (
                    <Cell 
                      key={index} 
                      fill={COLORS[index % COLORS.length]} 
                      style={{
                        filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}80)`
                      }}
                    />
                  ))}
                </Pie>
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
                  formatter={(value, name, props) => {
                    const idx = data.findIndex(d => d.symbol === name);
                    const color = COLORS[idx % COLORS.length];
                    return [`${Number(value).toFixed(1)}%`, 'Allocation'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full sm:flex-1 space-y-3 min-w-0 py-2">
            {data.slice(0, 5).map((item, i) => (
              <div key={item.symbol} className="flex items-center gap-3 text-sm group/item">
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor] transition-transform duration-300 group-hover/item:scale-125"
                  style={{ background: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 text-[var(--foreground)] font-bold tracking-wide uppercase">
                  {item.symbol?.replace('_USDT', '') || 'UNKNOWN'}
                </span>
                <span className={`text-xs font-extrabold uppercase tracking-widest ${
                  item.side === 'Long' ? 'text-glow-profit' : 'text-glow-loss'
                }`}>
                  {item.side}
                </span>
                <span className="text-[var(--muted-fg)] text-xs w-14 text-right font-mono font-bold group-hover/item:text-[var(--foreground)] transition-colors">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
