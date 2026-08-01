'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { TrendingUp, TrendingDown, Upload, Search, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';

type Trade = {
  id: string;
  trade_date: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  pnl: number;
  result: string;
  reasoning: string;
};

type ImportStatus = {
  type: 'success' | 'error' | 'idle';
  message: string;
};

/**
 * Parse Exness trade history CSV
 * Exness CSV columns: Order, Open Time, Type, Volume, Symbol, Open Price, S/L, T/P, Close Time, Close Price, Commission, Swap, Profit
 */
function parseExnessCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Find header row — Exness CSV sometimes has a few metadata lines at the top
  let headerIdx = lines.findIndex(l => 
    l.toLowerCase().includes('order') && 
    (l.toLowerCase().includes('open time') || l.toLowerCase().includes('type'))
  );
  if (headerIdx === -1) headerIdx = 0;

  const headers = lines[headerIdx]
    .split(',')
    .map(h => h.replace(/"/g, '').trim().toLowerCase());

  const trades = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith('#') || line.toLowerCase().includes('deposit') || line.toLowerCase().includes('withdrawal')) continue;

    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length < 5) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    // Map headers to our format (handle Exness column names)
    const orderId = row['order'] || row['ticket'] || row['deal'] || `row_${i}`;
    const openTime = row['open time'] || row['time'] || row['open_time'] || '';
    const closeTime = row['close time'] || row['close_time'] || openTime;
    const type = row['type'] || row['direction'] || 'buy';
    const volume = row['volume'] || row['lots'] || '0';
    const symbol = row['symbol'] || row['instrument'] || '';
    const openPrice = row['open price'] || row['open_price'] || row['price'] || '0';
    const closePrice = row['close price'] || row['close_price'] || openPrice;
    const commission = row['commission'] || '0';
    const swap = row['swap'] || '0';
    const profit = row['profit'] || '0';

    // Skip non-trade rows (Balance/Credit rows)
    if (!symbol || symbol === '') continue;
    if (type === 'balance' || type === 'credit') continue;

    trades.push({
      orderId,
      openTime,
      closeTime,
      type,
      volume,
      symbol,
      openPrice,
      closePrice,
      commission,
      swap,
      profit,
    });
  }

  return trades;
}

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ type: 'idle', message: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exness/import');
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
      }
    } catch (e) {
      console.error('Failed to fetch Exness trades', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Handle CSV file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setImportStatus({ type: 'error', message: 'Please upload a .csv file' });
      return;
    }

    setImporting(true);
    setImportStatus({ type: 'idle', message: '' });

    try {
      const text = await file.text();
      const parsedTrades = parseExnessCSV(text);

      if (parsedTrades.length === 0) {
        setImportStatus({ type: 'error', message: 'No valid trades found in CSV. Make sure you exported "Trading History" from Exness.' });
        setImporting(false);
        return;
      }

      const res = await fetch('/api/exness/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades: parsedTrades }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportStatus({
          type: 'success',
          message: `✅ ${data.inserted} new trades imported! ${data.skipped > 0 ? `(${data.skipped} duplicates skipped)` : ''}`,
        });
        fetchTrades();
      } else {
        setImportStatus({ type: 'error', message: data.error || 'Import failed' });
      }
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err.message });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filtered = trades.filter(t =>
    !search || t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const totalPnl = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = filtered.filter(t => t.result === 'Win').length;
  const losses = filtered.filter(t => t.result === 'Loss').length;
  const winRate = filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0;

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
            <span className="text-2xl">📊</span>
            Exness Trade History
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-3)' }}>
            Import your trades from Exness Trading History CSV
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrades}
            className="btn-secondary !py-2 flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={14} />
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Import Status */}
      {importStatus.type !== 'idle' && (
        <div
          className="card mb-4 flex items-center justify-between gap-3 !p-4"
          style={{
            background: importStatus.type === 'success' ? 'var(--profit-dim)' : 'var(--loss-dim)',
            borderColor: importStatus.type === 'success' ? 'var(--profit)' : 'var(--loss)',
          }}
        >
          <div className="flex items-center gap-3">
            {importStatus.type === 'success'
              ? <CheckCircle2 size={16} style={{ color: 'var(--profit)' }} />
              : <AlertCircle size={16} style={{ color: 'var(--loss)' }} />
            }
            <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{importStatus.message}</span>
          </div>
          <button onClick={() => setImportStatus({ type: 'idle', message: '' })}>
            <X size={14} style={{ color: 'var(--fg-3)' }} />
          </button>
        </div>
      )}

      {/* How to Export Instructions */}
      <div className="card mb-5 !p-4" style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-border)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--gold)' }}>📋 How to Export from Exness</p>
        <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: 'var(--fg-2)' }}>
          <li>Open Exness Personal Area → My Accounts</li>
          <li>Click on your MT4/MT5 account → Trade History</li>
          <li>Select the date range → Click Export (CSV)</li>
          <li>Upload the downloaded CSV file here</li>
        </ol>
      </div>

      {/* Stats Bar */}
      {!loading && trades.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Trades', value: filtered.length },
            { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? 'var(--profit)' : 'var(--loss)' },
            { label: 'Wins / Losses', value: `${wins} / ${losses}` },
            { label: 'Total PnL', value: `$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'var(--profit)' : 'var(--loss)' },
          ].map((stat) => (
            <div key={stat.label} className="card !p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--fg-3)' }}>{stat.label}</p>
              <p className="text-lg font-bold font-mono" style={{ color: stat.color || 'var(--fg)' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="card !py-3 !px-4 mb-4">
        <div className="flex items-center gap-2">
          <Search size={14} style={{ color: 'var(--fg-3)' }} />
          <input
            type="text"
            placeholder="Search by symbol (e.g. XAUUSD, EURUSD)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input !border-none !bg-transparent !p-0 !shadow-none text-sm flex-1"
          />
        </div>
      </div>

      {/* Trades Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-14 animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-4xl mb-3">📤</div>
          <p className="font-bold mb-1" style={{ color: 'var(--fg)' }}>No Exness trades found</p>
          <p className="text-sm" style={{ color: 'var(--fg-3)' }}>
            Click the "Import CSV" button above to load your Exness trade history
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Date / Time', 'Symbol', 'Direction', 'Lots', 'Entry', 'Exit', 'PnL', 'Result'].map(col => (
                  <th key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--fg-3)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade, i) => (
                <tr
                  key={trade.id}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)',
                  }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--fg-3)' }}>
                    {new Date(trade.trade_date).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-bold text-xs" style={{ color: 'var(--fg)' }}>
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: trade.direction === 'Long' ? 'var(--profit)' : 'var(--loss)' }}>
                      {trade.direction === 'Long' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--fg-2)' }}>
                    {trade.position_size}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--fg-2)' }}>
                    {trade.entry_price?.toFixed(5) || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--fg-2)' }}>
                    {trade.exit_price?.toFixed(5) || '—'}
                  </td>
                  <td className="px-4 py-3 font-bold font-mono text-xs" style={{ color: (trade.pnl || 0) >= 0 ? 'var(--profit)' : 'var(--loss)' }}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}{(trade.pnl || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="badge text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: trade.result === 'Win' ? 'var(--profit-dim)' : trade.result === 'Loss' ? 'var(--loss-dim)' : 'var(--surface-2)',
                        color: trade.result === 'Win' ? 'var(--profit)' : trade.result === 'Loss' ? 'var(--loss)' : 'var(--fg-3)',
                      }}
                    >
                      {trade.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
}
