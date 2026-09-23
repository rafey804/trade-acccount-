'use client';

// =============================================================================
// PnL Heatmap — Cyber-themed with enhanced colors and interactions
// =============================================================================

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { DailyPnl } from '@/lib/types';

interface PnLHeatmapProps {
  data: DailyPnl[];
  loading: boolean;
}

function getHeatmapColor(pnl: number, maxPnl: number): string {
  if (pnl === 0) return 'var(--surface-2)';
  const intensity = Math.min(Math.abs(pnl) / (maxPnl || 1), 1);

  if (pnl > 0) {
    // Cyan-to-emerald gradient for profits
    const r = Math.round(6 + intensity * 10);
    const g = Math.round(180 + intensity * 55);
    const b = Math.round(200 - intensity * 71);
    const alpha = 0.3 + intensity * 0.7;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    // Pink-to-rose gradient for losses
    const r = Math.round(220 + intensity * 24);
    const g = Math.round(60 - intensity * 30);
    const b = Math.round(110 - intensity * 16);
    const alpha = 0.3 + intensity * 0.7;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

function getGlowColor(pnl: number): string {
  if (pnl > 0) return 'rgba(6, 214, 224, 0.6)';
  if (pnl < 0) return 'rgba(244, 63, 94, 0.6)';
  return 'transparent';
}

export default function PnLHeatmap({ data, loading }: PnLHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; pnl: number; trades: number; x: number; y: number } | null>(null);

  const { weeks, months, maxPnl, pnlTradesMap } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const pnlMap = new Map<string, number>();
    const tradesMap = new Map<string, number>();
    data.forEach(d => {
      pnlMap.set(d.date, d.pnl);
      tradesMap.set(d.date, d.trades);
    });

    let maxP = 0;
    data.forEach(d => {
      maxP = Math.max(maxP, Math.abs(d.pnl));
    });

    const weeksArr: { date: Date; pnl: number; dateStr: string; trades: number }[][] = [];
    const monthsArr: { label: string; weekIndex: number }[] = [];
    let currentWeek: { date: Date; pnl: number; dateStr: string; trades: number }[] = [];
    let lastMonth = -1;

    const d = new Date(startDate);
    while (d <= today) {
      const dateStr = d.toISOString().split('T')[0];
      const pnl = pnlMap.get(dateStr) || 0;
      const trades = tradesMap.get(dateStr) || 0;
      currentWeek.push({ date: new Date(d), pnl, dateStr, trades });

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

    return { weeks: weeksArr, months: monthsArr, maxPnl: maxP, pnlTradesMap: tradesMap };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6 }}
      className="cyber-card relative"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--cyber-amber-dim)' }}>
          <Calendar size={16} style={{ color: 'var(--cyber-amber)' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Daily PnL Heatmap</h3>
          <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>GitHub-style contribution calendar</p>
        </div>
      </div>

      {loading ? (
        <div className="h-32 rounded-lg animate-shimmer" />
      ) : (
        <div className="overflow-x-auto relative">
          {/* Month Labels */}
          <div className="flex mb-1.5 ml-8">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-[10px] font-bold"
                style={{
                  color: 'var(--fg-3)',
                  marginLeft: i === 0 ? `${m.weekIndex * 18}px` : undefined,
                  width: '60px',
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Day Labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[14px] text-[9px] font-bold leading-[14px]" style={{ color: 'var(--fg-3)' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {wi === 0 && week[0] && Array.from({ length: week[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[14px] h-[14px]" />
                ))}
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    className="w-[14px] h-[14px] rounded-[3px] transition-all duration-200 cursor-pointer"
                    style={{
                      background: getHeatmapColor(day.pnl, maxPnl),
                      boxShadow: hoveredCell?.dateStr === day.dateStr && day.pnl !== 0
                        ? `0 0 8px ${getGlowColor(day.pnl)}`
                        : 'none',
                      outline: hoveredCell?.dateStr === day.dateStr
                        ? `2px solid var(--cyber-cyan)`
                        : 'none',
                      outlineOffset: '1px',
                      transform: hoveredCell?.dateStr === day.dateStr ? 'scale(1.3)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({
                        dateStr: day.dateStr,
                        pnl: day.pnl,
                        trades: day.trades,
                        x: rect.left,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Hover Tooltip */}
          {hoveredCell && (
            <div
              className="fixed z-50 pointer-events-none cyber-tooltip"
              style={{
                left: hoveredCell.x + 20,
                top: hoveredCell.y - 10,
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: 'var(--fg-3)' }}>
                {new Date(hoveredCell.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm font-black font-mono" style={{
                color: hoveredCell.pnl > 0 ? 'var(--cyber-emerald)' : hoveredCell.pnl < 0 ? 'var(--cyber-rose)' : 'var(--fg-3)',
              }}>
                {hoveredCell.pnl === 0 ? 'No trades' : `${hoveredCell.pnl > 0 ? '+' : ''}$${hoveredCell.pnl.toFixed(2)}`}
              </p>
              {hoveredCell.trades > 0 && (
                <p className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
                  {hoveredCell.trades} trade{hoveredCell.trades !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 justify-end text-[10px] font-bold" style={{ color: 'var(--fg-3)' }}>
            <span>Loss</span>
            <div className="flex gap-[3px]">
              {[0.3, 0.5, 0.7, 0.85, 1].map((i) => (
                <div
                  key={`loss-${i}`}
                  className="w-[12px] h-[12px] rounded-[3px]"
                  style={{ background: `rgba(244, 63, 94, ${i})` }}
                />
              ))}
            </div>
            <span className="mx-0.5 opacity-40">│</span>
            <div className="flex gap-[3px]">
              {[0.3, 0.5, 0.7, 0.85, 1].map((i) => (
                <div
                  key={`win-${i}`}
                  className="w-[12px] h-[12px] rounded-[3px]"
                  style={{ background: `rgba(6, 214, 224, ${i})` }}
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
