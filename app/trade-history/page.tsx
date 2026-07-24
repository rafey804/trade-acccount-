'use client';

import { useEffect, useState, useCallback } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { History, Search } from 'lucide-react';
import type { JournalEntry } from '@/types/journal';

export default function TradeHistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('setup', 'Auto-Synced'); // Only fetch auto-synced trades
      if (search) params.set('search', search);

      const res = await fetch(`/api/journal?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Handle Search Input (debounce)
  useEffect(() => {
    const delay = setTimeout(() => fetchEntries(), 300);
    return () => clearTimeout(delay);
  }, [search, fetchEntries]);

  return (
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <History size={24} className="text-emerald-500" />
            MEXC Trade History
          </h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            Auto-synced trades from your MEXC Futures account
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 p-2 border border-[var(--border)] rounded-xl bg-[var(--background)] max-w-sm">
          <Search size={18} className="text-[var(--muted-fg)] ml-2" />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] py-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-[var(--muted-fg)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 card text-[var(--muted-fg)]">
          <p className="mb-2">No auto-synced trades found.</p>
          <p className="text-sm">Trades from yesterday and today will appear here automatically when they exit.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-[var(--muted-fg)] uppercase bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Symbol</th>
                <th className="px-6 py-4 font-medium text-right">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-fg)]">
                    {new Date(entry.trade_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                    {entry.symbol}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        entry.pnl && entry.pnl > 0
                          ? 'text-emerald-500'
                          : entry.pnl && entry.pnl < 0
                          ? 'text-rose-500'
                          : 'text-[var(--muted-fg)]'
                      }`}
                    >
                      {entry.pnl != null
                        ? `${entry.pnl > 0 ? '+' : ''}${entry.pnl.toFixed(2)}`
                        : '-'}
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
