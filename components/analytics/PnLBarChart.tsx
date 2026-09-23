'use client';

// =============================================================================
// PnL Bar Chart — Premium cyber-themed with enhanced visuals
// =============================================================================

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
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
import type { WeeklyPnl } from '@/lib/types';

interface PnLBarChartProps {
  data: WeeklyPnl[];
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
      minWidth: '160px',
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
        {isPositive ? '+' : ''}${value.toFixed(2)}
      </p>
      {entry && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700 }}>
            <span style={{ color: 'var(--cyber-emerald)' }}>{entry.wins}W</span>
            <span style={{ color: 'var(--fg-3)', margin: '0 2px' }}>/</span>
            <span style={{ color: 'var(--cyber-rose)' }}>{entry.losses}L</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600 }}>
            {entry.trades} trades
          </span>
        </div>
      )}
    </div>
  );
}

export default function PnLBarChart({ data, loading }: PnLBarChartProps) {
  const maxVal = Math.max(...data.map(d => Math.abs(d.netPnl)), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--cyber-blue-dim)', boxShadow: '0 0 16px var(--cyber-blue-dim)' }}>
            <BarChart3 size={16} style={{ color: 'var(--cyber-blue)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Weekly Net PnL</h3>
            <p className="text-[10px] font-medium" style={{ color: 'var(--fg-3)' }}>Performance by week</p>
          </div>
        </div>
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-3 text-[10px] font-bold" style={{ color: 'var(--fg-3)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #34D399, #059669)' }} />
              Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #FB7185, #BE123C)' }} />
              Loss
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
              <div className="text-3xl mb-2">📊</div>
              <p>Log trades to see weekly PnL</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 5 }} barCategoryGap="20%">
              <defs>
                <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="barGradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                  <stop offset="50%" stopColor="#F43F5E" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity={0.85} />
                </linearGradient>
                <filter id="barShadowGreen" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10B981" floodOpacity="0.35" />
                </filter>
                <filter id="barShadowRed" x="-20%" y="-10%" width="140%" height="130%">
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
                dataKey="weekLabel"
                tick={{ fontSize: 10, fill: 'var(--fg-3)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                height={55}
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
                dataKey="netPnl"
                radius={[8, 8, 2, 2]}
                animationDuration={1400}
                animationEasing="ease-in-out"
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.netPnl >= 0 ? 'url(#barGradientGreen)' : 'url(#barGradientRed)'}
                    style={{ filter: entry.netPnl >= 0 ? 'url(#barShadowGreen)' : 'url(#barShadowRed)' }}
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
