'use client';

// =============================================================================
// Day of Week Chart — Premium cyber-themed bar chart
// =============================================================================

import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { DayOfWeekStats } from '@/lib/types';

interface DayOfWeekChartProps {
  data: DayOfWeekStats[];
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const entry = payload[0]?.payload;
  const isPositive = value >= 0;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--cyber-border)',
      borderRadius: '14px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 20px ${isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
      padding: '12px 16px',
      backdropFilter: 'blur(12px)',
      minWidth: '140px',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{
        fontSize: '20px',
        fontWeight: 900,
        fontFamily: 'var(--font-mono, monospace)',
        color: isPositive ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
        textShadow: `0 0 12px ${isPositive ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
      }}>
        {isPositive ? '+' : ''}${Number(value).toFixed(2)}
      </p>
      {entry && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600 }}>
            {entry.trades} trades
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: (entry.winRate || 0) >= 50 ? 'var(--cyber-emerald)' : 'var(--cyber-rose)',
          }}>
            {entry.winRate?.toFixed(0)}% WR
          </span>
        </div>
      )}
    </div>
  );
}

/** Custom bar label showing trade count */
function CustomBarLabel(props: any) {
  const { x, y, width, value, viewBox } = props;
  if (!value || value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      style={{
        fontSize: '10px',
        fontWeight: 800,
        fill: 'var(--fg-3)',
        letterSpacing: '0.02em',
      }}
    >
      {value}t
    </text>
  );
}

export default function DayOfWeekChart({ data, loading }: DayOfWeekChartProps) {
  // Find best/worst day
  const bestDay = data.length > 0 ? data.reduce((best, d) => d.avgPnl > best.avgPnl ? d : best, data[0]) : null;
  const worstDay = data.length > 0 ? data.reduce((worst, d) => d.avgPnl < worst.avgPnl ? d : worst, data[0]) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--cyber-amber-dim)', boxShadow: '0 0 16px var(--cyber-amber-dim)' }}>
            <CalendarDays size={16} style={{ color: 'var(--cyber-amber)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>PnL by Day of Week</h3>
            <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Average performance per day</p>
          </div>
        </div>
        {/* Best/Worst day badges */}
        {!loading && bestDay && worstDay && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--cyber-emerald)', border: '1px solid rgba(16,185,129,0.2)' }}>
              Best: {bestDay.day.slice(0, 3)}
            </span>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--cyber-rose)', border: '1px solid rgba(244,63,94,0.2)' }}>
              Worst: {worstDay.day.slice(0, 3)}
            </span>
          </div>
        )}
      </div>

      <div className="h-80" style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '12px 4px 4px 4px' }}>
        {loading ? (
          <div className="w-full h-full rounded-lg animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--fg-3)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <p>No data yet</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 25, right: 16, left: 8, bottom: 5 }} barCategoryGap="18%">
              <defs>
                <linearGradient id="dayBarGreen2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="dayBarRed2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                  <stop offset="50%" stopColor="#F43F5E" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity={0.85} />
                </linearGradient>
                <filter id="dayShadowGreen" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10B981" floodOpacity="0.35" />
                </filter>
                <filter id="dayShadowRed" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F43F5E" floodOpacity="0.35" />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                strokeOpacity={0.4}
                vertical={false}
              />
              <ReferenceLine
                y={0}
                stroke="var(--fg-3)"
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: 'var(--fg-3)', fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.slice(0, 3)}
                dy={5}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--fg-3)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--cyber-cyan-dim)', opacity: 0.2, radius: 8 }}
              />
              <Bar
                dataKey="avgPnl"
                radius={[8, 8, 2, 2]}
                animationDuration={1400}
                animationEasing="ease-in-out"
                maxBarSize={55}
                label={<CustomBarLabel />}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.avgPnl >= 0 ? 'url(#dayBarGreen2)' : 'url(#dayBarRed2)'}
                    style={{ filter: entry.avgPnl >= 0 ? 'url(#dayShadowGreen)' : 'url(#dayShadowRed)' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
