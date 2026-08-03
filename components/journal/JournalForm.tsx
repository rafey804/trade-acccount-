'use client';

// =============================================================================
// Journal Form — Complete trade entry form with all fields
// =============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Calculator } from 'lucide-react';
import StarRating from './StarRating';
import ScreenshotUploader from './ScreenshotUploader';
import { nowISO, calculatePnl, getTradeResult } from '@/lib/utils';
import type { JournalEntry, TradeDirection, TradeResult } from '@/lib/types';

const SETUPS = ['Liquidity Sweep', 'Order Block', 'FVG', 'Breakout', 'Custom'];
const DIRECTIONS: TradeDirection[] = ['Long', 'Short'];
const RESULTS: TradeResult[] = ['Win', 'Loss', 'Breakeven'];

interface JournalFormProps {
  editEntry?: JournalEntry | null;
  symbols: string[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
}

export default function JournalForm({
  editEntry,
  symbols,
  onSubmit,
  onCancel,
}: JournalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);

  // Form state
  const [tradeDate, setTradeDate] = useState(editEntry?.trade_date?.slice(0, 16) || nowISO());
  const [symbol, setSymbol] = useState(editEntry?.symbol || '');
  const [direction, setDirection] = useState<TradeDirection>(editEntry?.direction || 'Long');
  const [entryPrice, setEntryPrice] = useState(editEntry?.entry_price?.toString() || '');
  const [exitPrice, setExitPrice] = useState(editEntry?.exit_price?.toString() || '');
  const [positionSize, setPositionSize] = useState(editEntry?.position_size?.toString() || '');
  const [leverage, setLeverage] = useState(editEntry?.leverage?.toString() || '1');
  const [result, setResult] = useState<TradeResult | ''>(editEntry?.result || '');
  const [pnl, setPnl] = useState(editEntry?.pnl?.toString() || '');
  const [setup, setSetup] = useState(editEntry?.setup || '');
  const [reasoning, setReasoning] = useState(editEntry?.reasoning || '');
  const [mistake, setMistake] = useState(editEntry?.mistake || '');
  const [lesson, setLesson] = useState(editEntry?.lesson || '');
  const [emotionRating, setEmotionRating] = useState(editEntry?.emotion_rating || 3);
  const [beforeScreenshot, setBeforeScreenshot] = useState<string | null>(
    editEntry?.before_screenshot_url || null
  );
  const [afterScreenshot, setAfterScreenshot] = useState<string | null>(
    editEntry?.after_screenshot_url || null
  );

  // Auto-calculate PnL
  const autoCalcPnl = () => {
    const ep = parseFloat(entryPrice);
    const xp = parseFloat(exitPrice);
    const size = parseFloat(positionSize);
    const lev = parseInt(leverage) || 1;

    if (ep > 0 && xp > 0 && size > 0) {
      const calculated = calculatePnl(ep, xp, size, direction, lev);
      setPnl(calculated.toFixed(2));
      setResult(getTradeResult(calculated));
    }
  };

  // Filter symbols based on search
  const filteredSymbols = symbols.filter(s =>
    s.toLowerCase().includes(symbolSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        ...(editEntry?.id ? { id: editEntry.id } : {}),
        trade_date: new Date(tradeDate).toISOString(),
        symbol,
        direction,
        entry_price: parseFloat(entryPrice),
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        position_size: parseFloat(positionSize),
        leverage: parseInt(leverage) || 1,
        result: result || null,
        pnl: pnl ? parseFloat(pnl) : null,
        setup: setup || null,
        reasoning: reasoning || null,
        mistake: mistake || null,
        lesson: lesson || null,
        emotion_rating: emotionRating,
        before_screenshot_url: beforeScreenshot,
        after_screenshot_url: afterScreenshot,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card"
    >
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">
        {editEntry ? 'Edit Trade' : 'Log New Trade'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date & Time */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={tradeDate}
            onChange={(e) => setTradeDate(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Symbol with auto-suggest */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Asset / Pair
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              setSymbolSearch(e.target.value);
              setShowSymbolDropdown(true);
            }}
            onFocus={() => setShowSymbolDropdown(true)}
            onBlur={() => setTimeout(() => setShowSymbolDropdown(false), 200)}
            className="form-input"
            placeholder="BTC_USDT"
            required
          />
          {showSymbolDropdown && filteredSymbols.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full max-h-40 overflow-y-auto
                           bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-lg">
              {filteredSymbols.slice(0, 10).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSymbol(s);
                    setShowSymbolDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]
                             text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Direction
          </label>
          <div className="flex gap-2">
            {DIRECTIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer
                  ${direction === d
                    ? d === 'Long'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--muted-fg)]'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Entry Price */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Entry Price
          </label>
          <input
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="form-input"
            placeholder="0.00"
          />
        </div>

        {/* Exit Price */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Exit Price
          </label>
          <input
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="form-input"
            placeholder="0.00"
          />
        </div>

        {/* Position Size */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Position Size (USDT)
          </label>
          <input
            type="number"
            step="any"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            className="form-input"
            placeholder="100"
          />
        </div>

        {/* Leverage */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Leverage
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="form-input"
            placeholder="1"
          />
        </div>

        {/* Result */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Result
          </label>
          <div className="flex gap-2">
            {RESULTS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                  ${result === r
                    ? r === 'Win'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : r === 'Loss'
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--muted-fg)]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* PnL with auto-calc */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            PnL ($)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              className="form-input flex-1"
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={autoCalcPnl}
              className="btn-secondary px-3"
              title="Auto-calculate from prices"
            >
              <Calculator size={16} />
            </button>
          </div>
        </div>

        {/* Setup */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Setup Used
          </label>
          <select
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
            className="form-input"
          >
            <option value="">Select setup...</option>
            {SETUPS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Emotion Rating */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Discipline Rating
          </label>
          <StarRating value={emotionRating} onChange={setEmotionRating} />
        </div>
      </div>

      {/* Text areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Trade Reasoning
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="form-input h-24 resize-none"
            placeholder="Why did you take this trade?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Mistake Made
          </label>
          <textarea
            value={mistake}
            onChange={(e) => setMistake(e.target.value)}
            className="form-input h-24 resize-none"
            placeholder="Any mistakes?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
            Lesson Learned
          </label>
          <textarea
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="form-input h-24 resize-none"
            placeholder="What did you learn?"
          />
        </div>
      </div>

      {/* Screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ScreenshotUploader
          label="BEFORE Screenshot"
          value={beforeScreenshot}
          onChange={setBeforeScreenshot}
        />
        <ScreenshotUploader
          label="AFTER Screenshot"
          value={afterScreenshot}
          onChange={setAfterScreenshot}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              {editEntry ? 'Update Trade' : 'Save Trade'}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
