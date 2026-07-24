'use client';

// =============================================================================
// PnL Cards — Unrealized & Realized PnL with color coding
// =============================================================================

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface PnLCardsProps {
  unrealizedPnl: number;
  realizedToday: number;
  realizedWeek: number;
  realizedMonth: number;
  loading: boolean;
}

export default function PnLCards({
  unrealizedPnl,
  realizedToday,
  realizedWeek,
  realizedMonth,
  loading,
}: PnLCardsProps) {
  const pnlItems = [
    { label: 'Unrealized PnL', value: unrealizedPnl, live: true },
    { label: 'Today', value: realizedToday },
    { label: 'This Week', value: realizedWeek },
    { label: 'This Month', value: realizedMonth },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden group"
    >
      {/* Background Subtle Gradient depending on Unrealized PnL */}
      <div 
        className={`absolute inset-0 opacity-5 transition-colors duration-1000 ${unrealizedPnl >= 0 ? 'bg-[var(--profit)]' : 'bg-[var(--loss)]'}`}
      />

      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Activity size={18} className="text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
        <h3 className="text-sm font-bold text-[var(--foreground)] tracking-[0.15em] uppercase">Profit & Loss</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {pnlItems.map((item, i) => {
          const isProfit = item.value >= 0;
          const isLoss = item.value < 0;
          
          return (
            <div key={item.label} className="space-y-1.5 p-3 rounded-xl transition-all duration-300 hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-fg)] font-semibold tracking-wide uppercase">{item.label}</span>
                {item.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-pulse-live absolute h-full w-full rounded-full ${isProfit ? 'bg-[var(--profit)]' : 'bg-[var(--loss)]'}`} />
                    <span className={`relative h-2 w-2 rounded-full ${isProfit ? 'bg-[var(--profit)]' : 'bg-[var(--loss)]'} shadow-[0_0_8px_currentColor]`} />
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="h-8 w-24 rounded-lg animate-shimmer mt-1" />
              ) : (
                <div className={`text-2xl font-extrabold flex items-center gap-1.5 tracking-tight
                  ${isProfit ? 'text-glow-profit' : isLoss ? 'text-glow-loss' : 'text-[var(--muted-fg)]'}`}
                >
                  {isProfit && item.value !== 0 ? (
                    <TrendingUp size={16} strokeWidth={3} className="drop-shadow-md" />
                  ) : isLoss ? (
                    <TrendingDown size={16} strokeWidth={3} className="drop-shadow-md" />
                  ) : null}
                  <AnimatedCounter
                    value={Math.abs(item.value)}
                    prefix={item.value >= 0 ? '+$' : '-$'}
                    decimals={2}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
