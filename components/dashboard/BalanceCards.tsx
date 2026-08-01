'use client';

// =============================================================================
// Balance Cards — CSS variable aware, dark + light
// =============================================================================

import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { AccountOverview } from '@/lib/types';

interface Props { data: AccountOverview | null; loading: boolean; }

const cards = [
  { key: 'totalEquity',      label: 'Total Equity',      tag: 'USDT' },
  { key: 'availableBalance', label: 'Available Balance',  tag: 'FREE' },
  { key: 'marginUsed',       label: 'Margin Used',        tag: 'LOCKED' },
];

export default function BalanceCards({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="label">{card.label}</p>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
            >
              {card.tag}
            </span>
          </div>

          {loading ? (
            <div className="h-9 w-36 animate-shimmer" />
          ) : data ? (
            <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              <AnimatedCounter
                value={(data[card.key as keyof AccountOverview] as number) || 0}
                prefix="$"
                decimals={2}
              />
            </div>
          ) : (
            <div className="text-2xl font-bold" style={{ color: 'var(--fg-3)' }}>—</div>
          )}

          {/* Margin usage bar */}
          {!loading && data && card.key === 'marginUsed' && data.totalEquity > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="label">Usage</span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--gold)' }}>
                  {((data.marginUsed / data.totalEquity) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="progress-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.marginUsed / data.totalEquity) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="progress-fill-gold"
                />
              </div>
            </div>
          )}

          {!loading && !data && (
            <p className="text-[11px] mt-2" style={{ color: 'var(--fg-3)' }}>Connect Exness to see data</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
