'use client';

// =============================================================================
// Balance Cards — Total equity, available balance, margin used
// =============================================================================

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ShieldCheck } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { AccountOverview } from '@/lib/types';

interface BalanceCardsProps {
  data: AccountOverview | null;
  loading: boolean;
}

const cards = [
  {
    key: 'totalEquity',
    label: 'Total Equity',
    icon: Wallet,
    gradient: 'from-[var(--accent-primary)] to-blue-600',
    iconColor: 'text-[var(--accent-primary)]',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]',
  },
  {
    key: 'availableBalance',
    label: 'Available Balance',
    icon: TrendingUp,
    gradient: 'from-[var(--profit)] to-emerald-600',
    iconColor: 'text-[var(--profit)]',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(0,230,118,0.2)]',
  },
  {
    key: 'marginUsed',
    label: 'Margin Used',
    icon: ShieldCheck,
    gradient: 'from-[var(--accent-secondary)] to-purple-600',
    iconColor: 'text-[var(--accent-secondary)]',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(176,38,255,0.2)]',
  },
];

export default function BalanceCards({ data, loading }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`glass-card group relative overflow-hidden transition-all duration-500 ${card.glowColor}`}
        >
          {/* Subtle Background Radial Glow */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30 bg-gradient-to-br ${card.gradient}`} />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-[var(--muted-fg)] uppercase tracking-[0.15em]">
              {card.label}
            </span>
            <div className={`w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)]
                            flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
          </div>

          <div className="relative z-10">
            {loading ? (
              <div className="h-10 w-32 rounded-lg animate-shimmer" />
            ) : (
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)] drop-shadow-md`}>
                <AnimatedCounter
                  value={data?.[card.key as keyof AccountOverview] as number || 0}
                  prefix="$"
                  decimals={2}
                />
              </div>
            )}
          </div>

          {!loading && data && card.key === 'marginUsed' && data.totalEquity > 0 && (
            <div className="mt-4 relative z-10">
              <div className="flex justify-between text-xs font-semibold text-[var(--muted-fg)] mb-1.5 tracking-wide">
                <span>USAGE</span>
                <span className="text-[var(--accent-secondary)] drop-shadow-[0_0_8px_rgba(176,38,255,0.5)]">
                  {((data.marginUsed / data.totalEquity) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden border border-[var(--border)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.marginUsed / data.totalEquity) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-secondary)] to-purple-400 shadow-[0_0_10px_rgba(176,38,255,0.6)]"
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
