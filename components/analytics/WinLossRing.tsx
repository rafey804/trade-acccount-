'use client';

// =============================================================================
// Win/Loss Ring — Animated donut chart with neon glow
// =============================================================================

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface WinLossRingProps {
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  loading: boolean;
}

export default function WinLossRing({ wins, losses, breakeven, winRate, loading }: WinLossRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const total = wins + losses + breakeven;
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const winAngle = total > 0 ? (wins / total) * circumference : 0;
  const lossAngle = total > 0 ? (losses / total) * circumference : 0;
  const beAngle = total > 0 ? (breakeven / total) * circumference : 0;

  // Offsets for each segment
  const winOffset = circumference - winAngle;
  const lossStart = winAngle;
  const lossOffset = circumference - lossAngle;
  const beStart = winAngle + lossAngle;
  const beOffset = circumference - beAngle;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="cyber-card flex flex-col items-center"
    >
      <div className="flex items-center gap-2 mb-5 self-start">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--cyber-magenta-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyber-magenta)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2 a10 10 0 0 1 0 20" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Win / Loss Ratio</h3>
          <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Overall trade distribution</p>
        </div>
      </div>

      {loading ? (
        <div className="w-[180px] h-[180px] rounded-full animate-shimmer" />
      ) : total === 0 ? (
        <div className="w-[180px] h-[180px] flex items-center justify-center text-sm" style={{ color: 'var(--fg-3)' }}>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-xs">No trades yet</p>
          </div>
        </div>
      ) : (
        <>
          {/* SVG Donut */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="score-ring">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth={strokeWidth}
              />

              {/* Win segment */}
              {winAngle > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--cyber-emerald)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={isInView ? winOffset : circumference}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              )}

              {/* Loss segment */}
              {lossAngle > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--cyber-rose)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${lossAngle} ${circumference - lossAngle}`}
                  strokeDashoffset={isInView ? -lossStart : circumference}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.5))',
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                  }}
                />
              )}

              {/* Breakeven segment */}
              {beAngle > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--cyber-amber)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${beAngle} ${circumference - beAngle}`}
                  strokeDashoffset={isInView ? -beStart : circumference}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))',
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
                  }}
                />
              )}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black stat-value-shine">
                <AnimatedCounter value={winRate} suffix="%" decimals={1} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-3)' }}>
                Win Rate
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--cyber-emerald)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--fg-2)' }}>
                {wins} Wins
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--cyber-rose)', boxShadow: '0 0 8px rgba(244,63,94,0.5)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--fg-2)' }}>
                {losses} Losses
              </span>
            </div>
            {breakeven > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--cyber-amber)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--fg-2)' }}>
                  {breakeven} BE
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
