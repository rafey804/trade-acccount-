'use client';

// =============================================================================
// Sidebar — Professional, minimal, no logo
// =============================================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  History,
  ShieldCheck,
  Target,
  StickyNote,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { name: 'Strategy',      href: '/strategy',      icon: Target },
  { name: 'Discipline',    href: '/discipline',    icon: ShieldCheck },
  { name: 'Notes',         href: '/notes',         icon: StickyNote },

  { name: 'Journal',       href: '/journal',       icon: BookOpen },
  { name: 'Exness History', href: '/trade-history', icon: History },
  { name: 'Analytics',     href: '/analytics',     icon: BarChart3 },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        id="sidebar"
      >
        {/* Brand row — just text, no logo */}
        <div
          className="flex items-center gap-2.5 px-4 h-14 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-bold tracking-tight whitespace-nowrap"
                style={{ color: 'var(--fg)' }}
              >
                Trader
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group"
                style={{
                  background:    isActive ? 'var(--gold-dim)' : 'transparent',
                  color:         isActive ? 'var(--gold)'     : 'var(--fg-2)',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                id={`nav-${item.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                    style={{ background: 'var(--gold)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div
          className="px-2 py-3 space-y-1 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Theme toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3 py-1'}`}>
            <ThemeToggle />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--fg-3)' }}
                >
                  Toggle theme
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors duration-200 cursor-pointer text-left"
            style={{ color: 'var(--fg-3)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--loss)';
              (e.currentTarget as HTMLElement).style.background = 'var(--loss-dim)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-3)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            id="logout-button"
          >
            <LogOut size={16} strokeWidth={2} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] font-medium"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-xl transition-colors duration-200 cursor-pointer"
            style={{ color: 'var(--fg-3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-1.5"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}
        id="mobile-nav"
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const label = item.name === 'Trade History' ? 'History' : item.name;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors duration-200"
              style={{ color: isActive ? 'var(--gold)' : 'var(--fg-3)' }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
