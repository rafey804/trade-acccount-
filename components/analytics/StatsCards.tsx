'use client';

// =============================================================================
// Stats Cards — Aggregated analytics summary cards
// =============================================================================

import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, Calendar, Star, BarChart2 } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { AnalyticsData } from '@/lib/types';

interface StatsCardsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  const cards = [
    {
      label: 'Overall Win Rate',
      value: data?.overallWinRate || 0,
      suffix: '%',
      icon: Target,
      iconColor: 'text-[var(--accent-blue)]',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      label: 'Total Trades',
      value: data?.totalTrades || 0,
      suffix: '',
      decimals: 0,
      icon: BarChart2,
      iconColor: 'text-[var(--accent-gold)]',
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
    {
      label: 'Avg Risk-Reward',
      value: data?.avgRiskReward || 0,
      suffix: 'x',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-green-500/20',
    },
  ];

  const textCards = [
    {
      label: 'Most Profitable Setup',
      value: data?.mostProfitableSetup || 'N/A',
      icon: Star,
      iconColor: 'text-[var(--accent-gold)]',
    },
    {
      label: 'Best Trading Day',
      value: data?.bestTradingDay || 'N/A',
      icon: Calendar,
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Worst Trading Day',
      value: data?.worstTradingDay || 'N/A',
      icon: Calendar,
      iconColor: 'text-red-400',
    },
    {
      label: 'Most Common Mistake',
      value: data?.mostCommonMistake || 'N/A',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Numeric stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient}
                              flex items-center justify-center`}>
                <card.icon size={16} className={card.iconColor} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-24 rounded-md animate-shimmer" />
            ) : (
              <div className="text-2xl font-bold text-[var(--foreground)]">
                <AnimatedCounter
                  value={card.value}
                  suffix={card.suffix}
                  decimals={card.decimals ?? 1}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Text stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {textCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <card.icon size={14} className={card.iconColor} />
              <span className="text-[10px] font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            {loading ? (
              <div className="h-5 w-20 rounded-md animate-shimmer" />
            ) : (
              <p className="text-sm font-semibold text-[var(--foreground)] capitalize truncate">
                {card.value}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
