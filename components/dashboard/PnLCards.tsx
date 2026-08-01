'use client';

// =============================================================================
// PnL Cards — CSS variable aware
// =============================================================================

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface Props {
  unrealizedPnl: number;
  realizedToday: number;
  realizedWeek: number;
  realizedMonth: number;
  loading: boolean;
}

export default function PnLCards({ unrealizedPnl, realizedToday, realizedWeek, realizedMonth, loading }: Props) {
  const items = [
    { label: 'Unrealized P&L', value: unrealizedPnl, live: true },
    { label: 'Today',          value: realizedToday },
    { label: 'This Week',      value: realizedWeek },
    { label: 'This Month',     value: realizedMonth },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="label">Profit & Loss</p>
        <span className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>From Journal</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const pos  = item.value > 0;
          const neg  = item.value < 0;
          const zero = item.value === 0;
          const col  = pos ? 'var(--profit)' : neg ? 'var(--loss)' : 'var(--fg-3)';
          const bg   = pos ? 'var(--profit-dim)' : neg ? 'var(--loss-dim)' : 'var(--surface-2)';

          return (
            <div
              key={item.label}
              className="rounded-xl p-4 transition-colors duration-200"
              style={{ background: bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="label">{item.label}</span>
                {item.live && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                    style={{ background: col }}
                  />
                )}
              </div>

              {loading ? (
                <div className="h-7 w-24 animate-shimmer mt-1" />
              ) : (
                <div className="flex items-center gap-1" style={{ color: col }}>
                  {pos && !zero && <TrendingUp size={13} strokeWidth={2.5} />}
                  {neg           && <TrendingDown size={13} strokeWidth={2.5} />}
                  <span className="text-xl font-bold">
                    <AnimatedCounter
                      value={Math.abs(item.value)}
                      prefix={pos && !zero ? '+$' : neg ? '-$' : '$'}
                      decimals={2}
                    />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
