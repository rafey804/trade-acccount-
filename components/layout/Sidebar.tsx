'use client';

// =============================================================================
// Sidebar Navigation
// =============================================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Trade History', href: '/trade-history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-40
                   bg-[var(--background)] border-r border-[var(--border)]
                   backdrop-blur-xl shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
        id="sidebar"
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[var(--border)] bg-[var(--surface)]">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] whitespace-nowrap tracking-wider uppercase">
                Trader Command
              </h1>
              <p className="text-[10px] text-[var(--muted-fg)] font-bold tracking-[0.3em] uppercase">
                Center
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl
                           text-sm font-bold transition-all duration-300 uppercase tracking-widest
                           ${isActive
                             ? 'text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                             : 'text-[var(--muted-fg)] hover:text-[var(--foreground)]'
                           }
                           hover:bg-[var(--surface-hover)] group`}
                id={`nav-${item.name.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]/10
                               border border-[var(--accent-primary)]/30 shadow-[inset_0_0_15px_rgba(0,240,255,0.1)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10 shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-[var(--border)] space-y-3 bg-[var(--surface)]">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl
                       text-sm font-bold uppercase tracking-widest text-[var(--muted-fg)]
                       hover:text-[var(--loss)] hover:bg-[var(--loss)]/10 hover:shadow-[inset_0_0_15px_rgba(255,59,48,0.2)]
                       transition-all duration-300 cursor-pointer group"
            id="logout-button"
          >
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-3 rounded-xl
                       text-[var(--muted-fg)] hover:text-[var(--accent-primary)]
                       hover:bg-[var(--surface-hover)] transition-all duration-300 cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-[var(--background)] border-t border-[var(--border)] shadow-[0_-5px_30px_rgba(0,0,0,0.5)]
                      backdrop-blur-xl flex items-center justify-around py-2 px-2"
           id="mobile-nav"
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          // Shorter names for mobile
          const mobileName = item.name === 'Trade History' ? 'History' : item.name;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl
                         text-[9px] font-bold uppercase tracking-wider transition-all duration-300
                         ${isActive
                           ? 'text-[var(--accent-primary)] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                           : 'text-[var(--muted-fg)]'
                         }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="relative z-10 whitespace-nowrap">{mobileName}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
