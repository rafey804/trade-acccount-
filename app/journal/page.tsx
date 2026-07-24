'use client';

// =============================================================================
// PAGE 2: Trading Journal
// Log, view, filter, and manage trade journal entries
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import JournalForm from '@/components/journal/JournalForm';
import JournalCard from '@/components/journal/JournalCard';
import ScreenshotLightbox from '@/components/journal/ScreenshotLightbox';
import Modal from '@/components/ui/Modal';
import type { JournalEntry, TradeResult } from '@/lib/types';

const SETUPS = ['Liquidity Sweep', 'Order Block', 'FVG', 'Breakout', 'Custom'];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterResult, setFilterResult] = useState<TradeResult | ''>('');
  const [filterSetup, setFilterSetup] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterSymbol) params.set('symbol', filterSymbol);
      if (filterResult) params.set('result', filterResult);
      if (filterSetup) params.set('setup', filterSetup);

      const res = await fetch(`/api/journal?excludeAutoSynced=true&${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterSymbol, filterResult, filterSetup]);

  // Fetch symbols
  useEffect(() => {
    fetch('/api/mexc/symbols')
      .then(res => res.json())
      .then(data => {
        if (data.symbols) {
          setSymbols(data.symbols.map((s: { symbol: string }) => s.symbol));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Create / Update
  const handleSubmit = async (data: Record<string, unknown>) => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/journal', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setShowForm(false);
      setEditEntry(null);
      fetchEntries();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save');
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    const res = await fetch('/api/journal', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id));
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique symbols from entries for filter dropdown
  const entrySymbols = [...new Set(entries.map(e => e.symbol))];

  const hasFilters = filterSymbol || filterResult || filterSetup;

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Trading Journal</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            {entries.length} trade{entries.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditEntry(null);
              setShowForm(!showForm);
            }}
            className="btn-primary whitespace-nowrap"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span className="hidden sm:inline">{showForm ? 'Close Form' : 'Log Trade'}</span>
          </button>
        </div>
      </div>

      {/* Journal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="mb-6">
            <JournalForm
              editEntry={editEntry}
              symbols={symbols}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditEntry(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="glass-card !py-3 !px-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trades..."
              className="form-input pl-9 !py-2 text-sm"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary !py-2 text-xs ${hasFilters ? '!border-[var(--accent-blue)] !text-[var(--accent-blue)]' : ''}`}
          >
            <Filter size={14} />
            Filters
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
            )}
          </button>
        </div>

        {/* Filter dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="form-input !w-auto !py-1.5 text-xs"
              >
                <option value="">All Symbols</option>
                {entrySymbols.map(s => (
                  <option key={s} value={s}>{s.replace('_USDT', '/USDT')}</option>
                ))}
              </select>

              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value as TradeResult | '')}
                className="form-input !w-auto !py-1.5 text-xs"
              >
                <option value="">All Results</option>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="Breakeven">Breakeven</option>
              </select>

              <select
                value={filterSetup}
                onChange={(e) => setFilterSetup(e.target.value)}
                className="form-input !w-auto !py-1.5 text-xs"
              >
                <option value="">All Setups</option>
                {SETUPS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={() => {
                    setFilterSymbol('');
                    setFilterResult('');
                    setFilterSetup('');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card h-16 animate-shimmer" />
          ))
        ) : entries.length === 0 ? (
          <div className="glass-card text-center py-16">
            <p className="text-[var(--muted-fg)]">No trades found</p>
            <p className="text-sm text-[var(--muted-fg)] mt-1 opacity-60">
              {hasFilters ? 'Try adjusting your filters' : 'Click "Log Trade" to add your first entry'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map(entry => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                onScreenshotClick={(url, title) => {
                  setLightboxUrl(url);
                  setLightboxTitle(title);
                }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Trade"
      >
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Are you sure you want to delete this trade entry? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Screenshot Lightbox */}
      <ScreenshotLightbox
        isOpen={!!lightboxUrl}
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
        title={lightboxTitle}
      />
    </PageTransition>
  );
}
