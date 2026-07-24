'use client';

// =============================================================================
// Journal Card — Expandable accordion entry card
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Edit3, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatDate, formatFullCurrency, getResultBadgeColor } from '@/lib/utils';
import StarRating from './StarRating';
import { ScreenshotThumbnail } from './ScreenshotLightbox';
import type { JournalEntry } from '@/lib/types';

interface JournalCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onScreenshotClick: (url: string, title: string) => void;
}

export default function JournalCard({
  entry,
  onEdit,
  onDelete,
  onScreenshotClick,
}: JournalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.direction === 'Long';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card !p-0 overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer
                   hover:bg-[var(--card-hover)] transition-colors"
      >
        {/* Symbol & Direction */}
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex items-center gap-1 badge text-xs
            ${isLong
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}
          >
            {isLong ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {entry.direction}
          </span>
          <span className="font-semibold text-[var(--foreground)] truncate">
            {entry.symbol.replace('_USDT', '/USDT')}
          </span>
        </div>

        {/* Date */}
        <span className="text-xs text-[var(--muted-fg)] hidden sm:block">
          {formatDate(entry.trade_date)}
        </span>

        {/* Result Badge */}
        <span className={`badge text-xs ${getResultBadgeColor(entry.result)}`}>
          {entry.result || 'Open'}
        </span>

        {/* PnL */}
        <span className={`font-semibold text-sm font-mono ml-auto
          ${(entry.pnl || 0) > 0 ? 'text-emerald-400' : (entry.pnl || 0) < 0 ? 'text-red-400' : 'text-[var(--muted-fg)]'}`}
        >
          {entry.pnl !== null ? formatFullCurrency(entry.pnl) : '—'}
        </span>

        {/* Setup */}
        {entry.setup && (
          <span className="text-xs text-[var(--accent-blue)] font-medium hidden md:block">
            {entry.setup}
          </span>
        )}

        {/* Expand arrow */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[var(--muted-fg)]" />
        </motion.div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-[var(--border)]">
              {/* Price & Size Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <DetailItem label="Entry Price" value={`$${entry.entry_price}`} />
                <DetailItem label="Exit Price" value={entry.exit_price ? `$${entry.exit_price}` : '—'} />
                <DetailItem label="Size" value={`$${entry.position_size}`} />
                <DetailItem label="Leverage" value={`${entry.leverage}x`} />
              </div>

              {/* Discipline Rating */}
              {entry.emotion_rating && (
                <div className="mt-4">
                  <span className="text-xs text-[var(--muted-fg)] font-medium">Discipline</span>
                  <div className="mt-1">
                    <StarRating value={entry.emotion_rating} onChange={() => {}} readonly size={18} />
                  </div>
                </div>
              )}

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {entry.reasoning && (
                  <TextBlock label="Reasoning" text={entry.reasoning} />
                )}
                {entry.mistake && (
                  <TextBlock label="Mistake" text={entry.mistake} color="text-red-400" />
                )}
                {entry.lesson && (
                  <TextBlock label="Lesson" text={entry.lesson} color="text-emerald-400" />
                )}
              </div>

              {/* Screenshots */}
              {(entry.before_screenshot_url || entry.after_screenshot_url) && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {entry.before_screenshot_url && (
                    <ScreenshotThumbnail
                      url={entry.before_screenshot_url}
                      label="Before"
                      onClick={() => onScreenshotClick(entry.before_screenshot_url!, 'Before')}
                    />
                  )}
                  {entry.after_screenshot_url && (
                    <ScreenshotThumbnail
                      url={entry.after_screenshot_url}
                      label="After"
                      onClick={() => onScreenshotClick(entry.after_screenshot_url!, 'After')}
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                <button onClick={() => onEdit(entry)} className="btn-secondary text-xs">
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={() => onDelete(entry.id)} className="btn-danger text-xs">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-[var(--muted-fg)] uppercase tracking-wider font-semibold">{label}</span>
      <p className="text-sm font-semibold text-[var(--foreground)] font-mono">{value}</p>
    </div>
  );
}

function TextBlock({ label, text, color }: { label: string; text: string; color?: string }) {
  return (
    <div className="bg-[var(--muted)]/30 rounded-lg p-3">
      <span className={`text-[10px] uppercase tracking-wider font-semibold ${color || 'text-[var(--muted-fg)]'}`}>
        {label}
      </span>
      <p className="text-sm text-[var(--foreground)] mt-1 leading-relaxed">{text}</p>
    </div>
  );
}
