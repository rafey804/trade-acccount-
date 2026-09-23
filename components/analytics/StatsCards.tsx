'use client';

// =============================================================================
// Stats Cards — Cyber-themed analytics summary cards
// Animated gradient borders, neon accents, sparklines
// =============================================================================

import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, Calendar, Star, BarChart2, Zap } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { AnalyticsData } from '@/lib/types';

interface StatsCardsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

/** Mini sparkline SVG for win rate trend */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <polygon
        points={`${padding},${height} ${points} ${width - padding},${height}`}
        fill={`url(#spark-${color})`}
      />
    </svg>
  );
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  const heroCards = [
    {
      label: 'Overall Win Rate',
      value: data?.overallWinRate || 0,
      suffix: '%',
      icon: Target,
      accentColor: 'var(--cyber-cyan)',
      accentDim: 'var(--cyber-cyan-dim)',
      sparkData: data?.overallWinRateTrend,
    },
    {
      label: 'Total Trades',
      value: data?.totalTrades || 0,
      suffix: '',
      decimals: 0,
      icon: BarChart2,
      accentColor: 'var(--cyber-magenta)',
      accentDim: 'var(--cyber-magenta-dim)',
    },
    {
      label: 'Avg Risk-Reward',
      value: data?.avgRiskReward || 0,
      suffix: 'x',
      icon: TrendingUp,
      accentColor: 'var(--cyber-emerald)',
      accentDim: 'rgba(16, 185, 129, 0.12)',
    },
  ];

  const insightCards = [
    {
      label: 'Most Profitable Setup',
      value: data?.mostProfitableSetup || 'N/A',
      icon: Star,
      accentColor: 'var(--cyber-amber)',
      accentDim: 'var(--cyber-amber-dim)',
      emoji: '⚡',
    },
    {
      label: 'Best Trading Day',
      value: data?.bestTradingDay || 'N/A',
      icon: Calendar,
      accentColor: 'var(--cyber-emerald)',
      accentDim: 'rgba(16, 185, 129, 0.12)',
      emoji: '🏆',
    },
    {
      label: 'Worst Trading Day',
      value: data?.worstTradingDay || 'N/A',
      icon: Calendar,
      accentColor: 'var(--cyber-rose)',
      accentDim: 'rgba(244, 63, 94, 0.12)',
      emoji: '📉',
    },
    {
      label: 'Most Common Mistake',
      value: data?.mostCommonMistake || 'N/A',
      icon: AlertTriangle,
      accentColor: 'var(--cyber-amber)',
      accentDim: 'var(--cyber-amber-dim)',
      emoji: '⚠️',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {heroCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="cyber-card-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>
                {card.label}
              </span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: card.accentDim,
                  boxShadow: `0 0 16px ${card.accentDim}`,
                }}
              >
                <card.icon size={16} style={{ color: card.accentColor }} />
              </div>
            </div>

            {loading ? (
              <div className="h-9 w-28 rounded-md animate-shimmer" />
            ) : (
              <div className="flex items-end justify-between">
                <div className="text-3xl font-black stat-value-shine">
                  <AnimatedCounter
                    value={card.value}
                    suffix={card.suffix}
                    decimals={card.decimals ?? 1}
                  />
                </div>
                {card.sparkData && (
                  <Sparkline data={card.sparkData} color={card.accentColor} />
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="cyber-card"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-base">{card.emoji}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: card.accentColor }}>
                {card.label}
              </span>
            </div>
            {loading ? (
              <div className="h-5 w-24 rounded-md animate-shimmer" />
            ) : (
              <p className="text-sm font-bold capitalize truncate" style={{ color: 'var(--fg)' }}>
                {card.value}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
