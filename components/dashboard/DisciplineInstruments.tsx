'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type DisciplineStats = {
  sessionTrades: number;
  dailyLoss: number;
  cooldownActive: boolean;
  weeklyScore: number;
  longestStreak: number;
  dailyStatus: (boolean | null)[];
};

export default function DisciplineInstruments() {
  const [stats, setStats] = useState<DisciplineStats | null>(null);
  const [habitProgress, setHabitProgress] = useState(0);

  useEffect(() => {
    // Fetch discipline stats
    fetch('/api/stats/discipline')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      });
      
    // Get habit tracker score
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`habits_${today}`);
    if (saved) {
      const checked = JSON.parse(saved);
      const completed = Object.values(checked).filter(Boolean).length;
      // 5 habits total
      setHabitProgress(Math.round((completed / 5) * 100));
    }

    // Refresh every minute
    const t = setInterval(() => {
      fetch('/api/stats/discipline')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStats(data);
        });
    }, 60000);
    return () => clearInterval(t);
  }, []);

  if (!stats) {
    return <div className="card h-[250px] animate-pulse bg-[var(--surface-2)]" />;
  }

  const { sessionTrades, dailyLoss, cooldownActive, weeklyScore, longestStreak, dailyStatus } = stats;

  const maxTrades = 4;
  const maxLoss = 5;

  const tradesExceeded = sessionTrades >= maxTrades;
  const lossExceeded = dailyLoss >= maxLoss;
  const isLocked = tradesExceeded || lossExceeded || cooldownActive;

  // Calculate readiness score
  let readinessScore = habitProgress;
  if (isLocked) readinessScore = 0; // instantly 0 if locked
  
  let readinessText = 'Clear to Engage';
  let readinessColor = 'var(--profit)';
  let readinessBg = 'rgba(16, 185, 129, 0.1)';
  
  if (isLocked) {
    readinessText = 'LOCKED - Do Not Trade';
    readinessColor = 'var(--danger)';
    readinessBg = 'rgba(239, 68, 68, 0.1)';
  } else if (habitProgress < 100) {
    readinessText = 'Pending Habits Checklist';
    readinessColor = 'var(--gold)';
    readinessBg = 'rgba(245, 158, 11, 0.1)';
  }

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* ── Discipline Instruments Card ── */}
      <div className="card lg:col-span-3 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[var(--gold)]">🛡️</span>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Discipline Instruments</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Session Trades */}
          <div className="p-4 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface-2)' }}>
            <span className="text-2xl font-bold font-mono" style={{ color: tradesExceeded ? 'var(--danger)' : 'var(--fg)' }}>
              {sessionTrades}/{maxTrades}
            </span>
            <span className="text-[11px] font-bold mt-2" style={{ color: 'var(--fg-2)' }}>Session Trades</span>
            <span className="text-[9px] mt-0.5" style={{ color: 'var(--fg-3)' }}>London + NY today</span>
          </div>

          {/* Daily Loss Limit */}
          <div className="p-4 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface-2)' }}>
            <span className="text-2xl font-bold font-mono" style={{ color: lossExceeded ? 'var(--danger)' : 'var(--fg)' }}>
              ${dailyLoss.toFixed(0)}
            </span>
            <span className="text-[11px] font-bold mt-2" style={{ color: 'var(--fg-2)' }}>Daily Loss Limit</span>
            <span className="text-[9px] mt-0.5" style={{ color: 'var(--fg-3)' }}>of ${maxLoss} ceiling</span>
          </div>

          {/* Cooldown Guard */}
          <div className="p-4 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface-2)' }}>
            <div className="relative w-12 h-12 mb-1">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={cooldownActive ? 'var(--danger)' : 'var(--profit)'}
                  strokeWidth="4"
                  strokeDasharray="100, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--fg)' }}>
                  {cooldownActive ? 'Lock' : 'Clear'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold mt-1" style={{ color: 'var(--fg-2)' }}>Cooldown Guard</span>
            <span className="text-[9px] mt-0.5" style={{ color: 'var(--fg-3)' }}>
              {cooldownActive ? 'active 2h lock' : 'no active revenge lock'}
            </span>
          </div>
        </div>

        {/* Readiness Banner */}
        <div className="p-3 rounded-xl border flex items-start gap-3" style={{ background: readinessBg, borderColor: readinessColor }}>
          <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: readinessColor, boxShadow: `0 0 8px ${readinessColor}` }} />
          <div>
            <h3 className="text-[12px] font-bold" style={{ color: 'var(--fg)' }}>
              Trade Readiness — {readinessText} ({readinessScore}/100)
            </h3>
            <p className="text-[10px] mt-1" style={{ color: 'var(--fg-2)' }}>
              {isLocked 
                ? 'Your account is locked for the day. Close the platform.'
                : habitProgress < 100 
                  ? 'Session active, no cooldown, under loss limit — only "rules checked" is pending today.'
                  : 'All checks passed. Log your first trade when setup confirms.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Weekly Discipline Card ── */}
      <div className="card lg:col-span-2 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[var(--gold)]">📅</span>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Weekly Discipline</h2>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 mb-5">
          {/* Circular Score */}
          <div className="relative w-24 h-24 mb-6">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--info)"
                strokeWidth="3"
                strokeDasharray={`${weeklyScore}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${weeklyScore}, 100` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{weeklyScore}%</span>
              <span className="text-[8px] uppercase tracking-widest text-[var(--fg-3)]">7-Day Score</span>
            </div>
          </div>

          {/* Days Row */}
          <div className="flex items-center justify-between w-full px-2">
            {daysOfWeek.map((day, idx) => {
              const status = dailyStatus[idx];
              const isToday = idx === new Date().getDay();
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--fg-3)' }}>{day}</span>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ 
                      background: 'var(--surface-2)',
                      border: isToday ? '1px solid var(--gold-border)' : '1px solid transparent'
                    }}
                  >
                    {status === true && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                    )}
                    {status === false && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] opacity-50" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <span className="text-xs" style={{ color: 'var(--fg-3)' }}>Longest clean streak</span>
          <span className="text-xs font-bold" style={{ color: longestStreak > 0 ? 'var(--profit)' : 'var(--danger)' }}>
            {longestStreak > 0 ? '🔥' : '💥'} {longestStreak} days
          </span>
        </div>
      </div>
    </div>
  );
}
