'use client';

// =============================================================================
// Discipline Tracker — The Strict Manager
// Session-based trade counter, rules checklist, cooldown timer, loss limit
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  RotateCcw,
  Flame,
  TrendingDown,
  Globe2,
  Trophy,
  XCircle,
  Ban,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TradeSession {
  london: number;
  newYork: number;
  date: string; // YYYY-MM-DD
}

interface RulesState {
  [key: string]: boolean;
}

interface WeeklyDay {
  date: string;
  label: string;
  followed: boolean | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RULES = [
  { id: 'pairs', label: 'Only XAU/USD (Gold) & BTC/USD — no altcoins', emoji: '🎯' },
  { id: 'sessions', label: 'Trade only in London (12–5 PM) or NY (6–11 PM) session', emoji: '⏰' },
  { id: 'risk', label: 'Max risk per trade: 2% of balance ($2 on $100)', emoji: '⚖️' },
  { id: 'cooldown', label: '2-hour cooldown after any loss — no revenge trading', emoji: '🧊' },
  { id: 'daylimit', label: 'Daily loss limit $5 — hit it, close the app', emoji: '🛑' },
];

const MAX_LONDON = 2;
const MAX_NY = 2;
const COOLDOWN_DURATION = 2 * 60 * 60 * 1000; // 2 hours ms
const DAILY_LOSS_LIMIT = 5;

function todayStr() {
  // Return today's date in PKT (UTC+5)
  const now = new Date();
  const pkt = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  return pkt.toISOString().slice(0, 10);
}

function pktHour() {
  return (new Date().getUTCHours() + 5) % 24;
}

function getCurrentSession(): 'london' | 'newyork' | 'none' {
  const h = pktHour();
  if (h >= 12 && h < 17) return 'london';
  if (h >= 18 && h < 23) return 'newyork';
  return 'none';
}

function usePersist<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [state, set];
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ─── Session Badge ────────────────────────────────────────────────────────────

function SessionIndicator({ session }: { session: 'london' | 'newyork' | 'none' }) {
  const pkt = new Date(Date.now() + 5 * 3600000);
  const timeStr = pkt.toUTCString().slice(17, 25);

  const info = {
    london: { label: '🇬🇧 London Session', color: '#818CF8', time: '12:00 PM – 5:00 PM PKT', active: true },
    newyork: { label: '🇺🇸 New York Session', color: '#38BDF8', time: '6:00 PM – 11:00 PM PKT', active: true },
    none: { label: 'No Active Session', color: 'var(--fg-3)', time: 'Wait for London or NY', active: false },
  }[session];

  return (
    <div className="glass-card !p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: info.color,
            boxShadow: info.active ? `0 0 10px ${info.color}` : 'none',
            animation: info.active ? 'pulse-gold 2s infinite' : 'none',
          }}
        />
        <div>
          <p className="text-sm font-black" style={{ color: info.active ? info.color : 'var(--fg-3)' }}>
            {info.label}
          </p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--fg-3)' }}>{info.time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-lg font-black" style={{ color: 'var(--fg)' }}>{timeStr}</p>
        <p className="section-label">PKT Time</p>
      </div>
    </div>
  );
}

// ─── Cooldown Timer ───────────────────────────────────────────────────────────

function CooldownTimer({ endsAt, onEnd }: { endsAt: number | null; onEnd: () => void }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const left = endsAt - Date.now();
      if (left <= 0) { setRemaining(0); onEnd(); }
      else setRemaining(left);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt, onEnd]);

  const hrs = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  if (!endsAt || remaining <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card animate-countdown-pulse !p-5 relative overflow-hidden"
      style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}
    >
      <div className="absolute inset-0 opacity-5"
        style={{ background: 'radial-gradient(circle at center, #EF4444, transparent)' }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Ban size={18} style={{ color: '#EF4444', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' }} />
          <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>
            Cooldown Active — No Trading!
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {[
            { val: hrs, label: 'HRS' },
            { val: mins, label: 'MIN' },
            { val: secs, label: 'SEC' },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <span className="text-2xl font-black mx-1" style={{ color: 'var(--fg-3)' }}>:</span>}
              <div className="inline-flex flex-col items-center px-4 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', minWidth: 64 }}>
                <span className="text-3xl font-black font-mono" style={{ color: '#F87171' }}>
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--fg-2)' }}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--fg-2)' }}>
          Stay away from the charts. Come back when timer expires.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DisciplinePage() {
  const now = useLiveClock();
  const currentSession = getCurrentSession();
  const today = todayStr();

  // Persisted state
  const [trades, setTrades] = usePersist<TradeSession>('disc_trades', { london: 0, newYork: 0, date: today });
  const [rules, setRules] = usePersist<RulesState>('disc_rules', {});
  const [cooldownEnds, setCooldownEnds] = usePersist<number | null>('disc_cooldown', null);
  const [dailyLoss, setDailyLoss] = usePersist<number>('disc_dailyloss', 0);
  const [weeklyLog, setWeeklyLog] = usePersist<Record<string, boolean>>('disc_weekly', {});
  const [showLossOverlay, setShowLossOverlay] = useState(false);
  const dailyLossInput = useRef<HTMLInputElement>(null);

  // Reset trades if new day
  useEffect(() => {
    if (trades.date !== today) {
      setTrades({ london: 0, newYork: 0, date: today });
      setRules({});
      setDailyLoss(0);
    }
  }, [now, today, trades.date, setTrades, setRules, setDailyLoss]);

  // Check if daily loss limit hit
  useEffect(() => {
    if (dailyLoss >= DAILY_LOSS_LIMIT) setShowLossOverlay(true);
  }, [dailyLoss]);

  // Discipline score — are all rules checked?
  const allRulesFollowed = RULES.every(r => rules[r.id]);

  // Save today's discipline status at end of session
  const markToday = useCallback((followed: boolean) => {
    setWeeklyLog(prev => ({ ...prev, [today]: followed }));
  }, [today, setWeeklyLog]);

  // Handle cooldown end
  const handleCooldownEnd = useCallback(() => {
    setCooldownEnds(null);
  }, [setCooldownEnds]);

  // Add trade
  const addTrade = (session: 'london' | 'newYork') => {
    setTrades(prev => {
      if (prev.date !== today) return { london: 0, newYork: 0, date: today };
      const key = session;
      const limit = session === 'london' ? MAX_LONDON : MAX_NY;
      if (prev[key] >= limit) return prev;
      return { ...prev, [key]: prev[key] + 1 };
    });
  };

  const removeTrade = (session: 'london' | 'newYork') => {
    setTrades(prev => ({
      ...prev,
      [session]: Math.max(0, prev[session] - 1),
    }));
  };

  const totalTrades = trades.london + trades.newYork;
  const totalMax = MAX_LONDON + MAX_NY;
  const isCooldownActive = cooldownEnds !== null && cooldownEnds > Date.now();

  // Weekly days
  const weekDays: WeeklyDay[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().slice(0, 10);
    return {
      date: dateKey,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      followed: dateKey in weeklyLog ? weeklyLog[dateKey] : null,
    };
  });

  const disciplineScore = Math.round(
    (weekDays.filter(d => d.followed === true).length / 7) * 100
  );

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <PageTransition>
      {/* Daily Loss Limit Overlay */}
      <AnimatePresence>
        {showLossOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: 'var(--bg)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card max-w-md w-full text-center !p-10"
              style={{ border: '2px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.08)' }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <XCircle size={40} style={{ color: '#EF4444', filter: 'drop-shadow(0 0 16px rgba(239,68,68,0.6))' }} />
              </div>
              <h2 className="text-2xl font-black mb-3" style={{ color: '#F87171' }}>
                🛑 Daily Loss Limit Hit!
              </h2>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-2)' }}>
                You have lost ${dailyLoss.toFixed(2)} today — limit is ${DAILY_LOSS_LIMIT}
              </p>
              <p className="text-xs mb-8 leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                Close Exness NOW. Step away from the screen. Come back tomorrow with fresh eyes.
                Revenge trading will only make things worse.
              </p>
              <button
                onClick={() => setShowLossOverlay(false)}
                className="btn-danger w-full !py-3 !text-sm"
              >
                I understand — closing Exness now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient BG */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: '#10B981' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-[0.03] blur-[100px]"
          style={{ background: '#EF4444' }} />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #10B981, #059669)' }} />
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--fg)' }}>
                Discipline Tracker
              </h1>
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase ml-3" style={{ color: 'var(--fg-3)' }}>
              Your Strict Digital Manager
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: isCooldownActive ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${isCooldownActive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.2)'}`,
            }}>
            <ShieldCheck size={16} style={{ color: isCooldownActive ? '#EF4444' : '#10B981' }} />
            <span className="text-xs font-black uppercase tracking-wider"
              style={{ color: isCooldownActive ? '#EF4444' : '#10B981' }}>
              {isCooldownActive ? 'Cooldown Active' : 'System Active'}
            </span>
          </div>
        </motion.div>

        {/* Cooldown Banner */}
        {isCooldownActive && (
          <CooldownTimer endsAt={cooldownEnds} onEnd={handleCooldownEnd} />
        )}

        {/* Session Indicator */}
        <motion.div {...fadeUp(0.05)}>
          <SessionIndicator session={currentSession} />
        </motion.div>

        {/* Trade Counters */}
        <motion.div {...fadeUp(0.1)}>
          <div className="glass-card">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                <Globe2 size={15} style={{ color: '#F5C842' }} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>
                  Session Trade Counter
                </h2>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>
                  {totalTrades}/{totalMax} trades used today
                </p>
              </div>
            </div>

            {totalTrades >= totalMax && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                <p className="text-xs font-black" style={{ color: '#F87171' }}>
                  🛑 Daily Limit Reached! No more trades today — come back tomorrow.
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'london' as const, label: '🇬🇧 London Session', time: '12:00 PM – 5:00 PM PKT', color: '#818CF8', max: MAX_LONDON, count: trades.london, isActive: currentSession === 'london' },
                { key: 'newYork' as const, label: '🇺🇸 New York Session', time: '6:00 PM – 11:00 PM PKT', color: '#38BDF8', max: MAX_NY, count: trades.newYork, isActive: currentSession === 'newyork' },
              ].map((s) => {
                const full = s.count >= s.max;
                return (
                  <div
                    key={s.key}
                    className="rounded-xl p-5 transition-all duration-300"
                    style={{
                      background: s.isActive ? `${s.color}0D` : 'var(--surface-2)',
                      border: `1px solid ${s.isActive ? `${s.color}35` : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-black" style={{ color: s.isActive ? s.color : 'var(--fg-3)' }}>
                          {s.label}
                        </p>
                        <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--fg-3)' }}>{s.time}</p>
                      </div>
                      {s.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                          style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Dots */}
                    <div className="flex items-center gap-3 mb-4">
                      {Array.from({ length: s.max }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{ scale: i < s.count ? 1 : 0.85 }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                          style={{
                            background: i < s.count ? `${s.color}20` : 'var(--surface-2)',
                            border: `2px solid ${i < s.count ? `${s.color}60` : 'var(--border-strong)'}`,
                            color: i < s.count ? s.color : 'var(--fg-3)',
                          }}
                        >
                          {i + 1}
                        </motion.div>
                      ))}
                      <span className="text-xs font-bold" style={{ color: 'var(--fg-3)' }}>/ {s.max} max</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addTrade(s.key)}
                        disabled={full || totalTrades >= totalMax}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: full || totalTrades >= totalMax ? 'var(--surface-2)' : `${s.color}15`,
                          border: `1px solid ${full || totalTrades >= totalMax ? 'var(--border)' : `${s.color}30`}`,
                          color: full || totalTrades >= totalMax ? 'var(--fg-3)' : s.color,
                        }}
                      >
                        <Plus size={13} />
                        Trade Taken
                      </button>
                      <button
                        onClick={() => removeTrade(s.key)}
                        disabled={s.count === 0}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-20"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}
                      >
                        <Minus size={13} />
                      </button>
                    </div>

                    {full && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-bold mt-2 text-center"
                        style={{ color: '#EF4444' }}
                      >
                        Session limit reached ✓
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Rules Checklist + Cooldown + Loss Limit in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Daily Rules Checklist */}
          <motion.div {...fadeUp(0.15)}>
            <div className="glass-card h-full">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                  <Flame size={15} style={{ color: '#F5C842' }} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>
                    Daily Rules
                  </h2>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>
                    {RULES.filter(r => rules[r.id]).length}/{RULES.length} checked today
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                {RULES.map((rule) => {
                  const checked = !!rules[rule.id];
                  return (
                    <motion.button
                      key={rule.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRules(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                      className="w-full flex items-start gap-3 p-3.5 rounded-xl transition-all duration-300 text-left"
                      style={{
                        background: checked ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                        border: `1px solid ${checked ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                      }}
                    >
                      <span className="mt-0.5 shrink-0">
                        {checked
                          ? <CheckCircle2 size={17} style={{ color: '#10B981', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }} />
                          : <Circle size={17} style={{ color: 'var(--fg-3)' }} />
                        }
                      </span>
                      <span className="text-[10px] font-bold leading-relaxed"
                        style={{ color: checked ? '#10B981' : 'var(--fg-2)' }}>
                        <span className="mr-1.5">{rule.emoji}</span>
                        {rule.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Save discipline for today */}
              <div className="flex gap-2">
                <button
                  onClick={() => markToday(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
                >
                  <CheckCircle2 size={13} /> Rules Followed ✓
                </button>
                <button
                  onClick={() => markToday(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                >
                  <XCircle size={13} /> Rules Broken ✗
                </button>
              </div>
            </div>
          </motion.div>

          {/* Cooldown + Loss Limit stacked */}
          <div className="space-y-5">
            {/* Revenge Trading Cooldown */}
            <motion.div {...fadeUp(0.2)}>
              <div className="glass-card">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Clock size={15} style={{ color: '#EF4444' }} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>
                      Revenge Trading Guard
                    </h2>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>2-hour cooldown after loss</p>
                  </div>
                </div>

                {isCooldownActive ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Ban size={14} style={{ color: '#EF4444' }} />
                    <span className="text-xs font-black" style={{ color: '#F87171' }}>Cooldown Active — See timer above</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      <span className="text-xs font-semibold" style={{ color: '#10B981' }}>No cooldown — system clear</span>
                    </div>
                    <button
                      onClick={() => setCooldownEnds(Date.now() + COOLDOWN_DURATION)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                    >
                      <TrendingDown size={14} />
                      I just took a loss — start cooldown
                    </button>
                  </div>
                )}

                {isCooldownActive && (
                  <button
                    onClick={() => setCooldownEnds(null)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                  >
                    <RotateCcw size={11} /> Reset Cooldown
                  </button>
                )}
              </div>
            </motion.div>

            {/* Daily Loss Limit */}
            <motion.div {...fadeUp(0.25)}>
              <div className="glass-card">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle size={15} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>
                      Daily Loss Limit
                    </h2>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>
                      ${dailyLoss.toFixed(2)} / ${DAILY_LOSS_LIMIT} limit
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="progress-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((dailyLoss / DAILY_LOSS_LIMIT) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background: dailyLoss >= DAILY_LOSS_LIMIT
                          ? 'linear-gradient(90deg, #EF4444, #F87171)'
                          : dailyLoss >= DAILY_LOSS_LIMIT * 0.6
                            ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                            : 'linear-gradient(90deg, #10B981, #34D399)',
                        boxShadow: dailyLoss >= DAILY_LOSS_LIMIT
                          ? '0 0 12px rgba(239,68,68,0.5)'
                          : '0 0 8px rgba(16,185,129,0.3)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] font-bold" style={{ color: 'var(--fg-3)' }}>$0</span>
                    <span className="text-[9px] font-bold" style={{ color: 'var(--fg-3)' }}>${DAILY_LOSS_LIMIT} LIMIT</span>
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    ref={dailyLossInput}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter today's loss ($)"
                    className="form-input flex-1 !text-xs !py-2.5"
                    style={{ color: 'var(--fg)' }}
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(dailyLossInput.current?.value || '0');
                      if (!isNaN(val) && val >= 0) {
                        setDailyLoss(val);
                        if (dailyLossInput.current) dailyLossInput.current.value = '';
                      }
                    }}
                    className="btn-primary !py-2 !px-4 !text-[10px]"
                  >
                    Update
                  </button>
                </div>
                {dailyLoss > 0 && (
                  <button
                    onClick={() => setDailyLoss(0)}
                    className="w-full mt-2 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                    style={{ color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                  >
                    Reset to $0
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Weekly Discipline Score */}
        <motion.div {...fadeUp(0.3)}>
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                  <Trophy size={15} style={{ color: '#F5C842' }} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>
                    Weekly Discipline Score
                  </h2>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>Last 7 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black"
                  style={{
                    color: disciplineScore >= 80 ? '#10B981' : disciplineScore >= 50 ? '#F5C842' : '#EF4444',
                    textShadow: `0 0 20px ${disciplineScore >= 80 ? 'rgba(16,185,129,0.5)' : disciplineScore >= 50 ? 'rgba(245,200,66,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }}>
                  {disciplineScore}%
                </p>
                <p className="text-[10px] font-bold" style={{ color: 'var(--fg-3)' }}>
                  {disciplineScore >= 80 ? '🔥 Excellent!' : disciplineScore >= 50 ? '💪 Keep Going' : '🧠 Tighten Up'}
                </p>
              </div>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const isToday = day.date === today;
                const color = day.followed === true ? '#10B981' : day.followed === false ? '#EF4444' : isToday ? '#F5C842' : 'var(--surface-2)';
                const bg = day.followed === true ? 'rgba(16,185,129,0.12)' : day.followed === false ? 'rgba(239,68,68,0.1)' : isToday ? 'rgba(245,200,66,0.08)' : 'var(--surface-2)';
                const border = day.followed === true ? 'rgba(16,185,129,0.3)' : day.followed === false ? 'rgba(239,68,68,0.25)' : isToday ? 'rgba(245,200,66,0.25)' : 'var(--border)';

                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5">
                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: isToday ? '#F5C842' : 'var(--fg-3)' }}>
                      {day.label}
                    </p>
                    <div
                      className="w-full aspect-square rounded-xl flex items-center justify-center"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      {day.followed === true && <CheckCircle2 size={16} style={{ color }} />}
                      {day.followed === false && <XCircle size={16} style={{ color }} />}
                      {day.followed === null && isToday && (
                        <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      )}
                    </div>
                    {isToday && (
                      <p className="text-[8px] font-black" style={{ color: '#F5C842' }}>TODAY</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 progress-track">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${disciplineScore}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                style={{
                  background: disciplineScore >= 80
                    ? 'linear-gradient(90deg, #059669, #10B981)'
                    : disciplineScore >= 50
                      ? 'linear-gradient(90deg, #C49A1A, #F5C842)'
                      : 'linear-gradient(90deg, #DC2626, #EF4444)',
                  boxShadow: `0 0 12px ${disciplineScore >= 80 ? 'rgba(16,185,129,0.4)' : disciplineScore >= 50 ? 'rgba(245,200,66,0.4)' : 'rgba(239,68,68,0.4)'}`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
