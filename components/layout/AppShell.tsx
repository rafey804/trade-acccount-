'use client';

// =============================================================================
// App Shell — sidebar offset aware of collapsed width
// =============================================================================

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from './Sidebar';
import Ticker from '@/components/ui/Ticker';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <SessionProvider>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
          <Sidebar />
          {/* Main — md:ml matches sidebar default width 220px */}
          <main className="flex-1 md:ml-[220px] pb-20 md:pb-0 min-h-screen flex flex-col">
            <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 w-full flex-1 flex flex-col">
              <div className="mb-6 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                <Ticker />
              </div>
              <div className="flex-1">
                {children}
              </div>
            </div>
          </main>
        </div>
      )}
    </SessionProvider>
  );
}
