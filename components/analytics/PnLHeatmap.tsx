'use client';

// =============================================================================
// PnL Heatmap — GitHub contribution-style daily PnL calendar
// =============================================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { DailyPnl } from '@/lib/types';

interface PnLHeatmapProps {
  data: DailyPnl[];
  loading: boolean;
}

function getHeatmapColor(pnl: number, maxPnl: number): string {
  if (pnl === 0) return 'var(--muted)';
  const intensity = Math.min(Math.abs(pnl) / (maxPnl || 1), 1);

  if (pnl > 0) {
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(16, 185, 129, ${alpha})`; // emerald
  } else {
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(239, 68, 68, ${alpha})`; // red
  }
}

export default function PnLHeatmap({ data, loading }: PnLHeatmapProps) {
  const { weeks, months, maxPnl } = useMemo(() => {
    // Build 52-week calendar ending today
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // ~52 weeks
    // Adjust to start on Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const pnlMap = new Map<string, number>();
    data.forEach(d => pnlMap.set(d.date, d.pnl));

    let maxP = 0;
    data.forEach(d => {
      maxP = Math.max(maxP, Math.abs(d.pnl));
    });

    const weeksArr: { date: Date; pnl: number; dateStr: string }[][] = [];
    const monthsArr: { label: string; weekIndex: number }[] = [];
    let currentWeek: { date: Date; pnl: number; dateStr: string }[] = [];
    let lastMonth = -1;

    const d = new Date(startDate);
    while (d <= today) {
      const dateStr = d.toISOString().split('T')[0];
      const pnl = pnlMap.get(dateStr) || 0;
      currentWeek.push({ date: new Date(d), pnl, dateStr });

      // Track month labels
      if (d.getMonth() !== lastMonth) {
        monthsArr.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeksArr.length,
        });
        lastMonth = d.getMonth();
      }

      if (d.getDay() === 6 || d.getTime() >= today.getTime()) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }

      d.setDate(d.getDate() + 1);
    }

    return { weeks: weeksArr, months: monthsArr, maxPnl: maxP };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-[var(--accent-gold)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Daily PnL Heatmap</h3>
      </div>

      {loading ? (
        <div className="h-32 rounded-lg animate-shimmer" />
      ) : (
        <div className="overflow-x-auto">
          {/* Month Labels */}
          <div className="flex mb-1 ml-8">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-[10px] text-[var(--muted-fg)]"
                style={{ marginLeft: i === 0 ? `${m.weekIndex * 18}px` : undefined, width: '60px' }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-[2px]">
            {/* Day Labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[14px] text-[9px] text-[var(--muted-fg)] leading-[14px]">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {/* Pad incomplete first week */}
                {wi === 0 && week[0] && Array.from({ length: week[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[14px] h-[14px]" />
                ))}
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    className="heatmap-cell"
                    style={{ background: getHeatmapColor(day.pnl, maxPnl) }}
                    title={`${day.dateStr}: $${day.pnl.toFixed(2)}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end text-[10px] text-[var(--muted-fg)]">
            <span>Loss</span>
            <div className="flex gap-[2px]">
              {[0.2, 0.4, 0.6, 0.8, 1].map((i) => (
                <div
                  key={`loss-${i}`}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{ background: `rgba(239, 68, 68, ${i})` }}
                />
              ))}
            </div>
            <span className="mx-1">—</span>
            <div className="flex gap-[2px]">
              {[0.2, 0.4, 0.6, 0.8, 1].map((i) => (
                <div
                  key={`win-${i}`}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{ background: `rgba(16, 185, 129, ${i})` }}
                />
              ))}
            </div>
            <span>Profit</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
