'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw } from 'lucide-react';

type LivePosition = {
  id: string;
  ticket: number;
  symbol: string;
  direction: 'Long' | 'Short';
  volume: number;
  open_price: number;
  current_price: number;
  floating_pnl: number;
  swap: number;
  open_time: string;
  last_updated: string;
};

export default function LiveTrades() {
  const [positions, setPositions] = useState<LivePosition[]>([]);
  const [totalFloating, setTotalFloating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/exness/live-positions');
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
        setTotalFloating(data.totalFloating || 0);
        setLastUpdate(new Date());
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // Refresh every 5 seconds for near real-time updates
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: positions.length > 0 ? 'var(--profit)' : 'var(--fg-3)' }} />
            {positions.length > 0 && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping" style={{ background: 'var(--profit)', opacity: 0.4 }} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
              Live Open Trades
            </h2>
            <p className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
              {isLive ? `Updates every 5s • Last: ${lastUpdate?.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'MT5 EA not connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLive ? (
            <Wifi size={14} style={{ color: 'var(--profit)' }} />
          ) : (
            <WifiOff size={14} style={{ color: 'var(--fg-3)' }} />
          )}
          <button onClick={fetchPositions} className="p-1.5 rounded-lg transition-colors" style={{ background: 'var(--surface-2)' }}>
            <RefreshCw size={12} style={{ color: 'var(--fg-3)' }} />
          </button>
          {positions.length > 0 && (
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold font-mono"
              style={{
                background: totalFloating >= 0 ? 'var(--profit-dim)' : 'var(--loss-dim)',
                color: totalFloating >= 0 ? 'var(--profit)' : 'var(--loss)',
                border: `1px solid ${totalFloating >= 0 ? 'var(--profit)' : 'var(--loss)'}22`,
              }}
            >
              {totalFloating >= 0 ? '+' : ''}{totalFloating.toFixed(2)} USD
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 rounded-xl animate-shimmer" />)}
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-3xl mb-2">💤</div>
          <p className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>No open trades</p>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
            {isLive ? 'No positions currently open in MT5' : 'MT5 EA is not running. Open MT5 and run the EA.'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {positions.map((pos) => {
              const pips = Math.abs(pos.current_price - pos.open_price);
              const isProfit = pos.floating_pnl >= 0;

              return (
                <motion.div
                  key={pos.ticket}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: isProfit ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${isProfit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                  }}
                >
                  {/* Left: Symbol + Direction */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: pos.direction === 'Long' ? 'var(--profit-dim)' : 'var(--loss-dim)' }}
                    >
                      {pos.direction === 'Long'
                        ? <TrendingUp size={14} style={{ color: 'var(--profit)' }} />
                        : <TrendingDown size={14} style={{ color: 'var(--loss)' }} />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate max-w-[80px] sm:max-w-full" style={{ color: 'var(--fg)' }}>{pos.symbol}</p>
                      <p className="text-[10px] font-mono whitespace-nowrap" style={{ color: 'var(--fg-3)' }}>
                        {pos.direction} · {pos.volume} lots
                      </p>
                    </div>
                  </div>

                  {/* Mid: Prices */}
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] font-mono" style={{ color: 'var(--fg-3)' }}>
                      Entry: {pos.open_price.toFixed(pos.symbol.includes('JPY') ? 3 : 5)}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--fg-2)' }}>
                      Now: {pos.current_price.toFixed(pos.symbol.includes('JPY') ? 3 : 5)}
                    </p>
                  </div>

                  {/* Mid: Time */}
                  <div className="text-center hidden md:block">
                    <p className="text-[10px]" style={{ color: 'var(--fg-3)' }}>{formatDate(pos.open_time)}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--fg-3)' }}>{formatTime(pos.open_time)}</p>
                  </div>

                  {/* Right: PnL */}
                  <div className="text-right">
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: isProfit ? 'var(--profit)' : 'var(--loss)' }}
                    >
                      {isProfit ? '+' : ''}{pos.floating_pnl.toFixed(2)}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--fg-3)' }}>USD float</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* MT5 Setup Hint */}
      {!isLive && (
        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-border)', border: '1px solid var(--gold-border)' }}>
          <p className="font-bold mb-1" style={{ color: 'var(--gold)' }}>⚡ Connect MT5</p>
          <p style={{ color: 'var(--fg-2)' }}>
            Run the <strong>TCC_Exness_AutoSync.ex5</strong> EA on any MT5 chart to see live trades here.
          </p>
        </div>
      )}
    </div>
  );
}
