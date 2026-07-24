'use client';

// =============================================================================
// Positions Table — Open futures positions with live data
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatPrice, formatFullCurrency, getPositionSide } from '@/lib/utils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface Position {
  positionId: string;
  symbol: string;
  holdVol: number;
  holdAvgPrice: number;
  positionType: number;
  leverage: number;
  unrealizedPnl: number;
  liquidatePrice: number;
  im: number;
  markPrice?: number;
}

interface PositionsTableProps {
  positions: Position[];
  loading: boolean;
}

export default function PositionsTable({ positions, loading }: PositionsTableProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-0 overflow-hidden relative"
      >
        <div className="px-6 py-5 border-b border-[var(--border)] relative z-10">
          <h3 className="text-sm font-bold text-[var(--foreground)] tracking-[0.15em] uppercase">Open Positions</h3>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4 border-b border-[var(--border)] last:border-0 relative z-10">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-5 w-20 rounded animate-shimmer" />
            ))}
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-0 overflow-hidden relative group"
    >
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between relative z-10 bg-[var(--surface)]">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <h3 className="text-sm font-bold text-[var(--foreground)] tracking-[0.15em] uppercase">Open Positions</h3>
        </div>
        <span className="badge bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
          {positions.length} active
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="px-6 py-16 text-center flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-4 opacity-50">
            <Activity size={24} className="text-[var(--muted-fg)]" />
          </div>
          <p className="text-sm text-[var(--muted-fg)] uppercase tracking-wider font-semibold">No active positions</p>
        </div>
      ) : (
        <div className="overflow-x-auto relative z-10">
          <table className="data-table">
            <thead>
              <tr className="bg-[var(--surface)]/50">
                <th>Symbol</th>
                <th>Side</th>
                <th>Entry Price</th>
                <th>Mark Price</th>
                <th>Size</th>
                <th>Lev</th>
                <th className="text-right">Unrealized PnL</th>
                <th className="text-right">Liq. Price</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {positions.map((pos) => {
                  const side = getPositionSide(pos.positionType);
                  const isLong = side === 'Long';
                  const pnl = pos.unrealizedPnl;
                  
                  return (
                    <motion.tr
                      key={pos.positionId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="group/row transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <td className="font-bold text-[var(--foreground)] tracking-wide">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${isLong ? 'bg-[var(--profit)] shadow-[0_0_8px_var(--profit)]' : 'bg-[var(--loss)] shadow-[0_0_8px_var(--loss)]'}`} />
                          {pos.symbol.replace('_USDT', '/USDT')}
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 badge font-extrabold uppercase tracking-widest
                          ${isLong
                            ? 'bg-[var(--profit)]/15 text-[var(--profit)] border border-[var(--profit)]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]'
                            : 'bg-[var(--loss)]/15 text-[var(--loss)] border border-[var(--loss)]/30 shadow-[0_0_10px_rgba(255,59,48,0.2)]'
                          }`}
                        >
                          {isLong ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                          {side}
                        </span>
                      </td>
                      <td className="font-mono text-sm tracking-tight text-[var(--muted-fg)] group-hover/row:text-[var(--foreground)] transition-colors">
                        {formatPrice(pos.holdAvgPrice)}
                      </td>
                      <td className="font-mono text-sm tracking-tight font-bold text-[var(--foreground)]">
                        <AnimatedCounter value={pos.markPrice || 0} decimals={Math.abs(pos.markPrice || 0) < 1 ? 4 : 2} />
                      </td>
                      <td className="font-mono text-sm text-[var(--muted-fg)]">{pos.holdVol}</td>
                      <td>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md border
                                         bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30
                                         shadow-[0_0_8px_rgba(176,38,255,0.2)]">
                          {pos.leverage}x
                        </span>
                      </td>
                      <td className={`font-mono text-sm text-right font-extrabold tracking-tight
                        ${pnl > 0 ? 'text-glow-profit' : pnl < 0 ? 'text-glow-loss' : 'text-[var(--muted-fg)]'}`}
                      >
                        <AnimatedCounter value={Math.abs(pnl)} prefix={pnl >= 0 ? '+$' : '-$'} decimals={2} />
                      </td>
                      <td className="font-mono text-sm text-right font-semibold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                        {formatPrice(pos.liquidatePrice)}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
