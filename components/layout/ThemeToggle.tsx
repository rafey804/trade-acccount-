'use client';

// =============================================================================
// Theme Toggle — Sun / Moon
// =============================================================================

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { Theme } from '@/lib/types';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as Theme | null;
    const initial = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      id="theme-toggle"
    >
      {theme === 'dark'
        ? <Sun size={15} strokeWidth={2} />
        : <Moon size={15} strokeWidth={2} />
      }
    </button>
  );
}
