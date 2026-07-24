'use client';

// =============================================================================
// Win Rate Card — Summary stats pulled from journal data
// =============================================================================

import { motion } from 'framer-motion';
import { Target, Trophy } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface WinRateCardProps {
  winRate: number;
  totalTrades: number;
  loading: boolean;
}

export default function WinRateCard({ winRate, totalTrades, loading }: WinRateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card relative overflow-hidden group"
    >
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Target size={18} className="text-[var(--accent-secondary)] drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" />
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-[0.15em]">Performance</h3>
      </div>

      {loading ? (
        <div className="space-y-3 relative z-10">
          <div className="h-10 w-20 rounded-md animate-shimmer" />
          <div className="h-3 w-32 rounded-md animate-shimmer" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)] mb-1">Win Rate</div>
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-baseline gap-1 truncate drop-shadow-md">
              <AnimatedCounter value={winRate} decimals={1} suffix="%" />
            </div>
            <div className="mt-4 h-2 rounded-full bg-[var(--surface)] overflow-hidden relative border border-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_10px_rgba(176,38,255,0.5)]"
              />
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)] mb-1">Total Trades</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] flex items-center sm:justify-end gap-2 drop-shadow-md">
              <AnimatedCounter value={totalTrades} decimals={0} />
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Trophy size={28} className="text-[var(--accent-primary)] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
