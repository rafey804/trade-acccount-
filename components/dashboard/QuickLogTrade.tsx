'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function QuickLogTrade() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [symbol, setSymbol] = useState('XAU/USD');
  const [direction, setDirection] = useState('Long');
  const [entryPrice, setEntryPrice] = useState('');
  const [positionSize, setPositionSize] = useState('0.01');
  const [result, setResult] = useState('Win');
  const [pnl, setPnl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_date: new Date().toISOString(),
          symbol,
          direction,
          entry_price: parseFloat(entryPrice) || 0,
          position_size: parseFloat(positionSize) || 0,
          result,
          pnl: parseFloat(pnl) || 0,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        // Reset form
        setEntryPrice('');
        setPnl('');
      } else {
        console.error('Failed to log trade');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary text-[12px] py-1.5 px-4 flex items-center gap-2"
        style={{ background: 'var(--profit)' }}
      >
        <span>⚡ Quick Log</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Quick Log Trade" maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <option>XAU/USD</option>
                <option>BTC/USD</option>
                <option>EUR/USD</option>
                <option>GBP/USD</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <option>Long</option>
                <option>Short</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Lot Size</label>
              <input
                type="number"
                step="any"
                required
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <option>Win</option>
                <option>Loss</option>
                <option>Breakeven</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>PnL ($)</label>
              <input
                type="number"
                step="any"
                required
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'var(--profit)', color: '#fff', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Trade'}
          </button>
        </form>
      </Modal>
    </>
  );
}
