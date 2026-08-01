'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const habitsList = [
  { id: 'sleep', label: 'Slept 7+ hours' },
  { id: 'news', label: 'Checked High Impact News' },
  { id: 'mental', label: 'Mental State is Calm & Focused' },
  { id: 'rules', label: 'Reviewed Trading Rules' },
  { id: 'risk', label: 'Risk max 2% per trade' },
];

export default function HabitTracker() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from local storage for today's date
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`habits_${today}`);
    if (saved) {
      setChecked(JSON.parse(saved));
    }
  }, []);

  const toggle = (id: string) => {
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);
    
    // Save to local storage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`habits_${today}`, JSON.stringify(newChecked));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((completedCount / habitsList.length) * 100);

  if (!mounted) return <div className="card h-[200px]" />;

  return (
    <div className="card h-full p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Daily Discipline Checklist</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-3)' }}>Complete this before trading</p>
        </div>
        <div className="text-xs font-bold font-mono" style={{ color: progress === 100 ? 'var(--profit)' : 'var(--gold)' }}>
          {progress}%
        </div>
      </div>

      <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full rounded-full"
          style={{ background: progress === 100 ? 'var(--profit)' : 'var(--gold)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-2">
        {habitsList.map((habit) => {
          const isDone = checked[habit.id];
          return (
            <label 
              key={habit.id}
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors"
              style={{ 
                background: isDone ? 'var(--surface)' : 'var(--surface-2)',
                border: `1px solid ${isDone ? 'var(--profit)' : 'transparent'}`,
                opacity: isDone ? 0.7 : 1
              }}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded cursor-pointer accent-[var(--profit)]"
                checked={!!isDone}
                onChange={() => toggle(habit.id)}
              />
              <span 
                className={`text-xs font-medium ${isDone ? 'line-through' : ''}`} 
                style={{ color: isDone ? 'var(--fg-3)' : 'var(--fg-2)' }}
              >
                {habit.label}
              </span>
            </label>
          );
        })}
      </div>

      {progress < 100 && (
        <div className="mt-4 p-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-center">
          <span className="text-[10px] font-bold text-[var(--danger)] uppercase tracking-wider">
            Do not trade until checklist is 100% complete
          </span>
        </div>
      )}
    </div>
  );
}
