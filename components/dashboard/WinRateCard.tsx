'use client';

// =============================================================================
// Win Rate Card — SVG ring, CSS variables
// =============================================================================

import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface Props { winRate: number; totalTrades: number; loading: boolean; }

export default function WinRateCard({ winRate, totalTrades, loading }: Props) {
  const size = 88;
  const sw   = 7;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (winRate / 100) * circ;

  const color = winRate >= 60 ? 'var(--profit)' : winRate >= 45 ? 'var(--gold)' : 'var(--loss)';
  const label = winRate >= 60 ? 'Excellent' : winRate >= 50 ? 'Good' : winRate >= 40 ? 'Needs Work' : 'Rebuild';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="card flex-1"
    >
      <p className="label mb-5">Performance</p>

      {loading ? (
        <div className="flex items-center gap-5">
          <div className="w-22 h-22 rounded-full animate-shimmer shrink-0" style={{ width: size, height: size }} />
          <div className="space-y-2">
            <div className="h-7 w-20 animate-shimmer" />
            <div className="h-4 w-28 animate-shimmer" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          {/* Ring */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
              <circle
                cx={size/2} cy={size/2} r={r}
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth={sw}
              />
              <motion.circle
                cx={size/2} cy={size/2} r={r}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
                className="score-ring"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold leading-none" style={{ color }}>
                {winRate.toFixed(0)}%
              </span>
              <span className="text-[9px] font-semibold mt-0.5" style={{ color: 'var(--fg-3)' }}>WIN</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div>
              <p className="label mb-0.5">Total Trades</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
                <AnimatedCounter value={totalTrades} decimals={0} />
              </p>
            </div>
            <div>
              <p className="label mb-0.5">Status</p>
              <p className="text-sm font-semibold" style={{ color }}>
                {label}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
